"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  CalendarDaysIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

// Mock data - in real app this would come from tRPC
const mockEvents = [
  {
    id: "1",
    title: "Pre-Burn Art Build Weekend",
    description: "Join us for an intensive weekend of building our 2024 art installation.",
    type: "ART_BUILD",
    category: "Workshop",
    startDate: new Date("2024-03-15T09:00:00"),
    endDate: new Date("2024-03-17T18:00:00"),
    location: "Community Workshop, Oakland",
    address: "123 Art Street, Oakland, CA",
    maxAttendees: 30,
    price: null,
    isPublic: true,
    status: "PUBLISHED",
    createdAt: new Date("2024-01-10"),
    creator: { name: "Alex Rodriguez" },
    _count: { rsvps: 25 }
  },
  {
    id: "2",
    title: "Persian New Year Celebration",
    description: "Celebrate Nowruz with traditional Persian food, music, and poetry.",
    type: "CULTURAL",
    category: "Social",
    startDate: new Date("2024-03-20T18:00:00"),
    endDate: new Date("2024-03-20T23:00:00"),
    location: "Persian Cultural Center, SF",
    address: "456 Culture Ave, San Francisco, CA",
    maxAttendees: 60,
    price: null,
    isPublic: true,
    status: "PUBLISHED",
    createdAt: new Date("2024-01-08"),
    creator: { name: "Maryam Hosseini" },
    _count: { rsvps: 45 }
  },
  {
    id: "3",
    title: "Fundraising Dinner & Auction",
    description: "Annual fundraising event with silent auction and Persian cuisine.",
    type: "FUNDRAISER",
    category: "Fundraising",
    startDate: new Date("2024-04-12T19:00:00"),
    endDate: new Date("2024-04-12T22:00:00"),
    location: "Private Residence, Berkeley",
    address: "789 Donor Dr, Berkeley, CA",
    maxAttendees: 50,
    price: 7500, // $75.00
    isPublic: false,
    status: "DRAFT",
    createdAt: new Date("2024-01-05"),
    creator: { name: "Amir Jalali" },
    _count: { rsvps: 12 }
  }
];

const mockStats = {
  totalEvents: 15,
  publishedEvents: 12,
  upcomingEvents: 8,
  totalRSVPs: 234,
  eventsByType: [
    { type: "WORKSHOP", count: 5 },
    { type: "SOCIAL", count: 4 },
    { type: "ART_BUILD", count: 3 },
    { type: "CULTURAL", count: 2 },
    { type: "FUNDRAISER", count: 1 }
  ]
};

interface EventManagementProps {
  tenantId: string;
}

export function EventManagement({ tenantId }: EventManagementProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    PUBLISHED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    POSTPONED: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-blue-100 text-blue-800"
  };

  const typeColors = {
    GENERAL: "bg-gray-100 text-gray-800",
    WORKSHOP: "bg-blue-100 text-blue-800",
    SOCIAL: "bg-purple-100 text-purple-800",
    ART_BUILD: "bg-orange-100 text-orange-800",
    FUNDRAISER: "bg-green-100 text-green-800",
    CULTURAL: "bg-pink-100 text-pink-800",
    MEETING: "bg-indigo-100 text-indigo-800",
    VOLUNTEER: "bg-teal-100 text-teal-800",
    EDUCATIONAL: "bg-yellow-100 text-yellow-800",
    ENTERTAINMENT: "bg-red-100 text-red-800"
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "Free";
    return `$${(price / 100).toFixed(2)}`;
  };

  const handleViewDetails = (event: any) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (eventId: string) => {
    console.log("Editing event:", eventId);
    // TODO: Implement edit event
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log("Deleting event:", eventId);
    // TODO: Implement delete event
  };

  if (showCreateEvent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
            Back to Events
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Event Creation Form</h3>
              <p className="text-gray-600 mb-4">
                The event creation form will be implemented here with fields for:
              </p>
              <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto mb-6">
                <li>• Event title and description</li>
                <li>• Date, time, and location</li>
                <li>• Event type and category</li>
                <li>• Maximum attendees and pricing</li>
                <li>• Rich content editor</li>
              </ul>
              <Button variant="outline">Coming Soon</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalEvents}</div>
            <p className="text-xs text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.publishedEvents}</div>
            <p className="text-xs text-gray-600">Live events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
              <ClockIcon className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockStats.upcomingEvents}</div>
            <p className="text-xs text-gray-600">Future events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total RSVPs</CardTitle>
              <UserGroupIcon className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mockStats.totalRSVPs}</div>
            <p className="text-xs text-gray-600">All events</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Event Management</CardTitle>
            <Button onClick={() => setShowCreateEvent(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="GENERAL">General</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SOCIAL">Social</option>
                <option value="ART_BUILD">Art Build</option>
                <option value="FUNDRAISER">Fundraiser</option>
                <option value="CULTURAL">Cultural</option>
                <option value="MEETING">Meeting</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="EDUCATIONAL">Educational</option>
                <option value="ENTERTAINMENT">Entertainment</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="POSTPONED">Postponed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Events Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">RSVPs</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{formatDate(event.startDate)}</div>
                        {event.endDate && (
                          <div className="text-gray-500">to {formatDate(event.endDate)}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[event.type as keyof typeof typeColors]}`}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status as keyof typeof statusColors]}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{event._count.rsvps}</div>
                        {event.maxAttendees && (
                          <div className="text-gray-500">of {event.maxAttendees}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(event)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No events found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-screen overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Event Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEventDetails(false)}
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedEvent.title}</h3>
                <div className="flex gap-2 mb-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[selectedEvent.type as keyof typeof typeColors]}`}>
                    {selectedEvent.type.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedEvent.status as keyof typeof statusColors]}`}>
                    {selectedEvent.status}
                  </span>
                </div>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Event Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatDate(selectedEvent.startDate)}</span>
                    </div>
                    {selectedEvent.endDate && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Ends: {formatDate(selectedEvent.endDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    {selectedEvent.address && (
                      <div className="text-gray-500 ml-6">{selectedEvent.address}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Registration</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-2 font-medium">{formatPrice(selectedEvent.price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">RSVPs:</span>
                      <span className="ml-2 font-medium">
                        {selectedEvent._count.rsvps}
                        {selectedEvent.maxAttendees && ` / ${selectedEvent.maxAttendees}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Visibility:</span>
                      <span className="ml-2">{selectedEvent.isPublic ? "Public" : "Private"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created By</h4>
                <p className="text-sm text-gray-600">{selectedEvent.creator.name}</p>
                <p className="text-xs text-gray-500">Created on {selectedEvent.createdAt.toLocaleDateString()}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={() => handleEditEvent(selectedEvent.id)} className="flex-1">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex-1"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}