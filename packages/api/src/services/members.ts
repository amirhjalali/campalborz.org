import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { UserStatus, UserRole, Prisma } from '@prisma/client';
import { emailService } from './email';
import { notificationService } from './notifications';
import { addDays } from 'date-fns';
import * as crypto from 'crypto';

interface MemberProfile {
  bio?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
  phoneNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  campRole?: string;
  yearsAtBurningMan?: number;
  playaname?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  availability?: {
    preBurn?: boolean;
    burnWeek?: boolean;
    postBurn?: boolean;
    yearRound?: boolean;
  };
  contributions?: {
    type: string;
    description: string;
    hours?: number;
    date?: Date;
  }[];
}

interface MembershipApplication {
  userId: string;
  tenantId: string;
  answers: Record<string, any>;
  references?: {
    name: string;
    email: string;
    relationship: string;
  }[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}

interface MemberDirectory {
  searchTerm?: string;
  skills?: string[];
  interests?: string[];
  roles?: UserRole[];
  status?: UserStatus[];
  sortBy?: 'name' | 'joinDate' | 'contributions';
  page: number;
  limit: number;
}

class MembersService {
  // Member Profile Management
  async updateMemberProfile(
    userId: string,
    tenantId: string,
    profile: MemberProfile
  ) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId }
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      // Merge with existing metadata
      const currentMetadata = (user.metadata as any) || {};
      const updatedMetadata = {
        ...currentMetadata,
        profile: {
          ...currentMetadata.profile,
          ...profile,
          updatedAt: new Date()
        }
      };

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { metadata: updatedMetadata }
      });

      logger.info('Member profile updated', { userId, tenantId });
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update member profile', { error, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile'
      });
    }
  }

  async getMemberProfile(userId: string, tenantId: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId },
        include: {
          eventRSVPs: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  startDate: true,
                  type: true
                }
              }
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          donations: {
            where: { status: 'COMPLETED' },
            select: {
              amount: true,
              createdAt: true,
              campaign: true
            },
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              eventRSVPs: true,
              donations: true,
              payments: true
            }
          }
        }
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Member not found'
        });
      }

      // Calculate member stats
      const stats = await this.getMemberStats(userId, tenantId);

      return {
        ...user,
        profile: (user.metadata as any)?.profile || {},
        stats
      };
    } catch (error) {
      logger.error('Failed to get member profile', { error, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get profile'
      });
    }
  }

  // Member Application System
  async submitMembershipApplication(
    userId: string,
    tenantId: string,
    application: Omit<MembershipApplication, 'userId' | 'tenantId' | 'submittedAt'>
  ) {
    try {
      const existingApplication = await prisma.memberApplication.findFirst({
        where: {
          userId,
          tenantId,
          status: { in: ['PENDING', 'UNDER_REVIEW'] }
        }
      });

      if (existingApplication) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You already have a pending application'
        });
      }

      const newApplication = await prisma.memberApplication.create({
        data: {
          userId,
          tenantId,
          answers: application.answers,
          references: application.references || [],
          status: 'PENDING',
          submittedAt: new Date()
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Notify admins
      await this.notifyAdminsOfApplication(newApplication);

      // Send confirmation to applicant
      await emailService.sendEmail({
        to: newApplication.user.email,
        subject: 'Membership Application Received',
        template: 'application-received',
        data: {
          name: newApplication.user.name,
          applicationId: newApplication.id
        }
      });

      logger.info('Membership application submitted', {
        applicationId: newApplication.id,
        userId,
        tenantId
      });

      return newApplication;
    } catch (error) {
      logger.error('Failed to submit membership application', { error, userId });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to submit application'
      });
    }
  }

  async reviewMembershipApplication(
    applicationId: string,
    reviewerId: string,
    tenantId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ) {
    try {
      const application = await prisma.memberApplication.findFirst({
        where: { id: applicationId, tenantId },
        include: {
          user: true
        }
      });

      if (!application) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Application not found'
        });
      }

      const updatedApplication = await prisma.$transaction(async (tx) => {
        // Update application
        const app = await tx.memberApplication.update({
          where: { id: applicationId },
          data: {
            status: decision.toUpperCase() as any,
            reviewedBy: reviewerId,
            reviewNotes: notes,
            reviewedAt: new Date()
          }
        });

        // If approved, update user status
        if (decision === 'approved') {
          await tx.user.update({
            where: { id: application.userId },
            data: {
              status: UserStatus.ACTIVE,
              role: UserRole.MEMBER,
              metadata: {
                ...(application.user.metadata as any),
                membershipApprovedAt: new Date()
              }
            }
          });
        }

        return app;
      });

      // Send notification to applicant
      await emailService.sendEmail({
        to: application.user.email,
        subject: `Membership Application ${decision === 'approved' ? 'Approved' : 'Rejected'}`,
        template: `application-${decision}`,
        data: {
          name: application.user.name,
          notes: notes || ''
        }
      });

      logger.info('Membership application reviewed', {
        applicationId,
        decision,
        reviewerId
      });

      return updatedApplication;
    } catch (error) {
      logger.error('Failed to review membership application', { error, applicationId });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to review application'
      });
    }
  }

  // Member Directory
  async searchMembers(
    tenantId: string,
    filters: MemberDirectory
  ) {
    try {
      const where: Prisma.UserWhereInput = {
        tenantId,
        status: UserStatus.ACTIVE,
        ...filters.roles?.length && { role: { in: filters.roles } },
        ...filters.status?.length && { status: { in: filters.status } }
      };

      if (filters.searchTerm) {
        where.OR = [
          { name: { contains: filters.searchTerm, mode: 'insensitive' } },
          { email: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }

      // Add skills/interests filter if provided
      if (filters.skills?.length || filters.interests?.length) {
        where.metadata = {
          path: ['profile'],
          array_contains: {
            ...(filters.skills?.length && { skills: filters.skills }),
            ...(filters.interests?.length && { interests: filters.interests })
          }
        };
      }

      const orderBy: Prisma.UserOrderByWithRelationInput = 
        filters.sortBy === 'name' ? { name: 'asc' } :
        filters.sortBy === 'joinDate' ? { createdAt: 'desc' } :
        { name: 'asc' };

      const [members, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            status: true,
            metadata: true,
            createdAt: true,
            _count: {
              select: {
                eventRSVPs: true,
                donations: true
              }
            }
          },
          orderBy,
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.user.count({ where })
      ]);

      // Format member profiles
      const formattedMembers = members.map(member => ({
        ...member,
        profile: (member.metadata as any)?.profile || {},
        contributions: {
          events: member._count.eventRSVPs,
          donations: member._count.donations
        }
      }));

      return {
        members: formattedMembers,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      logger.error('Failed to search members', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search members'
      });
    }
  }

  // Member Points & Rewards System
  async awardPoints(
    userId: string,
    tenantId: string,
    points: number,
    reason: string,
    category: 'event' | 'volunteer' | 'donation' | 'participation' | 'other'
  ) {
    try {
      const transaction = await prisma.memberPoints.create({
        data: {
          userId,
          tenantId,
          points,
          reason,
          category,
          awardedAt: new Date()
        }
      });

      // Update total points in user metadata
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId }
      });

      if (user) {
        const currentMetadata = (user.metadata as any) || {};
        const currentPoints = currentMetadata.totalPoints || 0;
        
        await prisma.user.update({
          where: { id: userId },
          data: {
            metadata: {
              ...currentMetadata,
              totalPoints: currentPoints + points
            }
          }
        });
      }

      // Check for achievements/badges
      await this.checkAchievements(userId, tenantId);

      logger.info('Points awarded to member', {
        userId,
        points,
        category,
        reason
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to award points', { error, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to award points'
      });
    }
  }

  async getMemberPoints(userId: string, tenantId: string) {
    try {
      const [totalPoints, transactions, rank] = await Promise.all([
        prisma.memberPoints.aggregate({
          where: { userId, tenantId },
          _sum: { points: true }
        }),
        prisma.memberPoints.findMany({
          where: { userId, tenantId },
          orderBy: { awardedAt: 'desc' },
          take: 20
        }),
        this.getMemberRank(userId, tenantId)
      ]);

      return {
        total: totalPoints._sum.points || 0,
        transactions,
        rank
      };
    } catch (error) {
      logger.error('Failed to get member points', { error, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get points'
      });
    }
  }

  // Private Helper Methods
  private async getMemberStats(userId: string, tenantId: string) {
    const [
      eventsAttended,
      totalDonations,
      volunteerHours,
      pointsTotal
    ] = await Promise.all([
      prisma.eventRSVP.count({
        where: {
          userId,
          tenantId,
          status: 'CONFIRMED'
        }
      }),
      prisma.donation.aggregate({
        where: {
          userId,
          tenantId,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      prisma.volunteerLog.aggregate({
        where: { userId, tenantId },
        _sum: { hours: true }
      }),
      prisma.memberPoints.aggregate({
        where: { userId, tenantId },
        _sum: { points: true }
      })
    ]);

    return {
      eventsAttended,
      totalDonations: totalDonations._sum.amount || 0,
      volunteerHours: volunteerHours._sum.hours || 0,
      points: pointsTotal._sum.points || 0
    };
  }

  private async getMemberRank(userId: string, tenantId: string) {
    const userPoints = await prisma.memberPoints.aggregate({
      where: { userId, tenantId },
      _sum: { points: true }
    });

    const totalPoints = userPoints._sum.points || 0;

    const higherRanked = await prisma.user.count({
      where: {
        tenantId,
        metadata: {
          path: ['totalPoints'],
          gt: totalPoints
        }
      }
    });

    return higherRanked + 1;
  }

  private async checkAchievements(userId: string, tenantId: string) {
    // Check various achievement criteria
    const stats = await this.getMemberStats(userId, tenantId);

    const achievements = [];
    
    if (stats.eventsAttended >= 10) {
      achievements.push('event_enthusiast');
    }
    
    if (stats.volunteerHours >= 50) {
      achievements.push('super_volunteer');
    }
    
    if (stats.totalDonations >= 100000) { // $1000 in cents
      achievements.push('generous_supporter');
    }
    
    if (stats.points >= 1000) {
      achievements.push('thousand_club');
    }

    // Store achievements in user metadata
    if (achievements.length > 0) {
      const user = await prisma.user.findFirst({
        where: { id: userId, tenantId }
      });

      if (user) {
        const metadata = (user.metadata as any) || {};
        const existingAchievements = metadata.achievements || [];
        const newAchievements = achievements.filter(a => !existingAchievements.includes(a));

        if (newAchievements.length > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              metadata: {
                ...metadata,
                achievements: [...existingAchievements, ...newAchievements]
              }
            }
          });

          // Notify user of new achievements
          for (const achievement of newAchievements) {
            await notificationService.create({
              tenantId,
              recipientId: userId,
              type: 'SYSTEM_ANNOUNCEMENT',
              title: 'New Achievement Unlocked!',
              message: `Congratulations! You've earned the "${achievement.replace(/_/g, ' ')}" achievement!`,
              data: { achievement }
            });
          }
        }
      }
    }
  }

  private async notifyAdminsOfApplication(application: any) {
    const admins = await prisma.user.findMany({
      where: {
        tenantId: application.tenantId,
        role: { in: ['ADMIN', 'TENANT_ADMIN'] },
        status: UserStatus.ACTIVE
      }
    });

    for (const admin of admins) {
      await notificationService.create({
        tenantId: application.tenantId,
        recipientId: admin.id,
        type: 'MEMBER_APPLICATION',
        title: 'New Membership Application',
        message: `${application.user.name} has submitted a membership application`,
        data: { applicationId: application.id }
      });
    }
  }
}

export const membersService = new MembersService();