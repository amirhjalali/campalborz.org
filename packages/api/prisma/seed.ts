import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════
// MEMBER DATA (78 members from the Alborzians spreadsheet)
// ═══════════════════════════════════════════════════════════════════

interface RawMember {
  name: string;
  email: string;
  housing: string | null;
  housingSize: string | null;
  arrival: string | null;
  departure: string | null;
  gender: string | null;
  preApproval: string | null;
  build: string | null;
  strike: string | null;
  dietary: string | null;
  alborzVirgin: string | null;
  bmVirgin: string | null;
}

const membersData: RawMember[] = [
  { name: 'Amir Jalali', email: 'amirhjalali@gmail.com', housing: 'Tent', housingSize: '10x12', arrival: '2025-08-20', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Ahson Jalali', email: 'ahsonjalali@gmail.com', housing: 'Tent', housingSize: '10x12', arrival: '2025-08-22', departure: '2025-09-01', gender: 'M', preApproval: 'Maybe', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Bita Mehrjou', email: 'bmehrjou@gmail.com', housing: 'shiftpod', housingSize: '12x12', arrival: '2025-08-22', departure: '2025-09-01', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Lila Neiswanger', email: 'lila.neiswanger@gmail.com', housing: 'Tent', housingSize: '10x14', arrival: '2025-08-20', departure: '2025-09-01', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Christian McDowell', email: 'coffinsfortheliving@gmail.com', housing: 'Shared', housingSize: null, arrival: '2025-08-20', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Kristofer Berg', email: 'kristofer.berg@gmail.com', housing: 'Shiftpod', housingSize: '14x14', arrival: '2025-08-22', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Jonathan Berg', email: 'mail.jonatanberg@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-22', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Mike Gold', email: 'michaelcharlesgold@gmail.com', housing: 'Shiftpod', housingSize: '12x12', arrival: '2025-08-23', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Patrick Emad', email: 'patrick.n.emad@gmail.com', housing: 'Trailer', housingSize: '28ft', arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Felix Huettenbach', email: 'felix.huettenbach@gmail.com', housing: 'RV', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: null, build: null, strike: null, dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Alva Burvall', email: 'alva.burvall@gmail.com', housing: null, housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: null, build: null, strike: null, dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Dadmehr', email: 'david@radrealty.ca', housing: 'Dorm', housingSize: null, arrival: '2025-08-20', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Mina', email: 'mina@radrealty.ca', housing: 'shared', housingSize: null, arrival: '2025-08-20', departure: '2025-09-01', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Marcelo Costa', email: 'marcelopenacosta@gmail.com', housing: 'RV', housingSize: '25ft', arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Artin Babayan', email: 'babayan.artin@yahoo.com', housing: 'Trailer', housingSize: 'Airstream', arrival: '2025-08-24', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Shaggy', email: 'shaghik.abolian@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-08-31', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Stevie Hatz', email: 'pleasure@hatz.xxx', housing: 'RV', housingSize: '25ft', arrival: '2025-08-24', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Dean Spanos', email: 'deanspanos14@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Rikard', email: 'rikard.virta@gmail.com', housing: 'Shiftpod', housingSize: '14x14', arrival: '2025-08-22', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Malin', email: 'malin.carlsdotter@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-22', departure: '2025-08-31', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Michael Tassavor', email: 'michael.tassavor@gmail.com', housing: 'RV', housingSize: '22ft', arrival: '2025-08-24', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Lily', email: 'lily.rasouli@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-08-31', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Sven Kopp', email: 'svenkoppmodel@googlemail.com', housing: 'Dorm', housingSize: null, arrival: '2025-08-22', departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Simon Avedissian', email: 'simonavedissian@gmail.com', housing: 'RV', housingSize: 'tbd', arrival: '2025-08-23', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Jennifer Browne', email: 'brownejenniferm@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-23', departure: '2025-09-01', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Alex Gharakhani', email: 'alex@nicolebakti.com', housing: 'RV', housingSize: '30ft', arrival: '2025-08-24', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: 'Y', strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Georgina Gharakhani', email: 'georgina.grkikian@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-08-31', gender: 'F', preApproval: 'Yes', build: 'Y', strike: 'Y', dietary: 'Vegetarian', alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Mira Maciejewski', email: 'mira.maciejewski@gmail.com', housing: 'RV', housingSize: '22ft', arrival: '2025-08-24', departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Nader Mortazavi', email: 'mortazavi.nader@gmail.com', housing: 'Tent', housingSize: '10x12', arrival: '2025-08-23', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Patrice Bäumel', email: 'patricebaumel@gmail.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Jack', email: 'hagop.mehtemetian@gmail.com', housing: 'Shiftpod', housingSize: '12x12', arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Sophie', email: 'sophie.s.flament@gmail.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Mona Chilingaryan', email: 'mona_chilingaryan@yahoo.com', housing: 'RV', housingSize: '32ft', arrival: '2025-08-24', departure: '2025-08-31', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'George Grkikian', email: 'ggrkikian@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Sahiba', email: 'sahibarathore@yahoo.com', housing: 'RV', housingSize: '29ft', arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Shawn Faull', email: 'sfaull90@gmail.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Sam Liss', email: 'samantha.n.liss@gmail.com', housing: 'Shiftpod', housingSize: '8x8', arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'N', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Cameron', email: 'cameron.willingham@gmail.com', housing: 'Tent', housingSize: '10x14', arrival: null, departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Kris', email: 'ksbrons.design@gmail.com', housing: 'Shared', housingSize: null, arrival: null, departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Daniel Duffin', email: 'duffin.daniel@gmail.com', housing: 'Hexayurt?', housingSize: '12x12', arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Samatha Shi', email: 'samantashi@gmail.com', housing: null, housingSize: 'shared', arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: 'Gluten Free', alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Oscar', email: 'oscar.severin@gmail.com', housing: 'Trailer', housingSize: '30ft', arrival: '2025-08-24', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Tobias Bigelius', email: 'tobiasjeriksson@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Bobby', email: 'bobby@theprimitivegourmet.com', housing: 'Tent', housingSize: '10x14', arrival: '2025-08-22', departure: '2025-08-31', gender: 'M', preApproval: 'No', build: null, strike: 'N', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Marcus Emad', email: 'marcusemad@gmail.com', housing: 'Shiftpod', housingSize: '12x12', arrival: '2025-08-23', departure: '2025-08-31', gender: 'F', preApproval: 'No', build: null, strike: null, dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Amy Ingraham', email: 'amyingram1997@gmail.com', housing: null, housingSize: null, arrival: '2025-08-23', departure: '2025-08-31', gender: 'M', preApproval: 'No', build: null, strike: null, dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Rami Kabala', email: 'ramiy.kabaha@gmail.com', housing: 'RV', housingSize: '28ft', arrival: '2025-08-21', departure: '2025-09-01', gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'ELIF', email: 'elftanverdi@gmail.com', housing: 'RV', housingSize: '24ft', arrival: '2025-08-24', departure: '2025-08-31', gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Fawaz Baba', email: 'fawaz@yahoo.com', housing: 'shared', housingSize: null, arrival: '2025-08-24', departure: '2025-08-31', gender: 'M', preApproval: 'Yes', build: null, strike: 'N', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Tiffany Huynh', email: 'tiffanyhuynh.ot@gmail.com', housing: 'dorm', housingSize: null, arrival: '2025-08-22', departure: '2025-09-01', gender: 'F', preApproval: 'yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Taylor Pierce', email: 'taylormpierce@gmail.com', housing: 'shared', housingSize: null, arrival: '2025-08-22', departure: '2025-09-01', gender: 'M', preApproval: 'yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Caroline Hellstrom', email: 'caroline.f.hellstrom@gmail.com', housing: 'dorm', housingSize: null, arrival: '2025-08-25', departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Marit Zerbe', email: 'marit.zerbe@gmail.com', housing: 'Tent', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Anouk De Lange', email: 'anoukdelange@gmail.com', housing: 'RV', housingSize: null, arrival: '2025-08-27', departure: '2025-09-01', gender: 'M', preApproval: null, build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Raminta Rapsyte', email: 'raminta313@gmail.com', housing: 'RV', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: null, build: null, strike: null, dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Jack Ajoian', email: 'jackajoian@gmail.com', housing: 'RV', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: null, build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Madison Lowe', email: 'madisonlowe21@gmail.com', housing: null, housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: null, build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: null },
  { name: 'Karina Salazar', email: 'karinasg87@hotmail.com', housing: 'RV', housingSize: '40x17ft', arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Paul Inzunza', email: 'paul@tna.mx', housing: 'shared with Paul', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Gonzalo Martinez', email: 'gmartinez@tsh.com.mx', housing: 'shared with Paul', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: null, build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Checo Miramontes', email: 'sergio@aurorapower.mx', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Rosalio Loredo', email: 'rosalio314@gmail.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Kat Minassi', email: 'kat@katminassievents.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'Y' },
  { name: 'Alvaro Navarro', email: 'alvaronvx@gmail.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Ana Jimenez', email: 'ana@jimenezsanmartin.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Paula Espinosa', email: 'paulaboutme11@gmail.com', housing: 'shared w/ ana', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Frida Ahlvarsson', email: 'frida@ahlvar.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: 'Vegetarian', alborzVirgin: 'N', bmVirgin: 'N' },
  { name: 'Jonathon Nystrom', email: 'jonatan@personasthlm.com', housing: 'shared w/ Frida Ahlvarsson', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Natty Kay', email: 'natalieghosn87@gmail.com', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Michael Watts', email: 'michaelwatts.dj@gmail.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: null, build: null, strike: null, dietary: null, alborzVirgin: 'Y', bmVirgin: null },
  { name: 'Mathieu Mozziconacci', email: 'mathieumozzi@hotmail.fr', housing: 'RV', housingSize: '25ft', arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Carina Lamprecht', email: 'carinalamprecht@aol.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Marissa Kash', email: 'marissakashkett@gmail.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Kimberly Piersall', email: 'kmpiersall@mac.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Alex Maniaci', email: 'maniaci.alex@gmail.com', housing: 'RV', housingSize: '22ft', arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Yanick Brown', email: 'yanickbrown@gmail.com', housing: 'shared', housingSize: null, arrival: null, departure: null, gender: 'M', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'Y' },
  { name: 'Maya Pletin', email: 'maya@dvs.guru', housing: 'Dorm', housingSize: null, arrival: null, departure: null, gender: 'F', preApproval: 'Yes', build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
  { name: 'Nik Gibler', email: 'nikkogibler@gmail.com', housing: 'Tent', housingSize: '10x14', arrival: null, departure: null, gender: 'M', preApproval: null, build: null, strike: 'Y', dietary: null, alborzVirgin: 'Y', bmVirgin: 'N' },
];

// ═══════════════════════════════════════════════════════════════════
// EXPENSE DATA (42 expenses from the Expenses sheet)
// ═══════════════════════════════════════════════════════════════════

interface RawExpense {
  paidBy: string;
  date: string;
  description: string;
  amount: number; // dollars (will be converted to cents)
  category: string;
  notes: string | null;
}

const expensesData: RawExpense[] = [
  { paidBy: 'ALBORZ', date: '2025-04-22', description: 'USS - United Site Services', amount: 6083.80, category: 'UTILITIES', notes: 'Grey Water and some RV Dumps. RV Dumps to be paid back. Approximately 1800' },
  { paidBy: 'ALBORZ', date: '2025-03-05', description: '2 BM Tickets for Raul and Rosalio', amount: 1514.24, category: 'OTHER', notes: 'ALBORZ Card' },
  { paidBy: 'Amir', date: '2025-03-05', description: '1 BM Ticket for Bobby', amount: 757.12, category: 'OTHER', notes: "Amir's Personal Card" },
  { paidBy: 'ALBORZ', date: '2025-05-23', description: 'Ecozoic Payment 1', amount: 3930.00, category: 'INFRASTRUCTURE', notes: 'The rest due in July' },
  { paidBy: 'ALBORZ', date: '2025-06-23', description: 'Payment to Peik Construction', amount: 10000.00, category: 'CONSTRUCTION', notes: 'Paid via ACH' },
  { paidBy: 'ALBORZ', date: '2025-07-01', description: 'Payment to Peik Construction', amount: 11000.00, category: 'CONSTRUCTION', notes: 'Paid via ACH' },
  { paidBy: 'Amir', date: '2025-07-05', description: 'Uber to Airport', amount: 32.95, category: 'TRANSPORTATION', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-05', description: 'Flight to Reno', amount: 199.18, category: 'TRANSPORTATION', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-05', description: 'Airport parking', amount: 72.00, category: 'TRANSPORTATION', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-05', description: 'Nixon Store Gas Station', amount: 60.61, category: 'TRANSPORTATION', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-07', description: 'HD Propane Refill', amount: 196.96, category: 'SUPPLIES', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-07', description: 'HD Locks and other supplies', amount: 99.59, category: 'SUPPLIES', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-07', description: '7/11 Waters, Ice and Drinks for Crew', amount: 29.98, category: 'FOOD', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-07', description: "Jimmy John's Lunch for the Crew", amount: 71.98, category: 'FOOD', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-08', description: 'Chevron Waters, Ice and Drinks for Crew', amount: 65.04, category: 'FOOD', notes: "Amir's Personal Card" },
  { paidBy: 'ALBORZ', date: '2025-07-08', description: 'Cash for Laborers', amount: 1300.00, category: 'CONSTRUCTION', notes: 'Cash from Alborz' },
  { paidBy: 'Amir', date: '2025-07-08', description: 'Circus Circus One Night', amount: 73.28, category: 'TRANSPORTATION', notes: "Amir's Personal Card" },
  { paidBy: 'ALBORZ', date: '2025-07-09', description: 'Ecozoic Remainder', amount: 11200.00, category: 'INFRASTRUCTURE', notes: 'Cash from Alborz (given to Daniel to pay Mira Tomorrow)' },
  { paidBy: 'ALBORZ', date: '2025-07-09', description: 'Walker Lake ACH', amount: 1877.50, category: 'SERVICES', notes: 'Paid via ACH. 1875+2.50 fee' },
  { paidBy: 'ALBORZ', date: '2025-07-09', description: 'Cash for Chaleo', amount: 2000.00, category: 'CONSTRUCTION', notes: 'Cash from Alborz' },
  { paidBy: 'ALBORZ', date: '2025-07-09', description: 'Cash for Raul', amount: 2000.00, category: 'CONSTRUCTION', notes: 'Cash from Alborz' },
  { paidBy: 'Amir', date: '2025-07-09', description: 'Amazon Order for Lighting and Faucet', amount: 754.31, category: 'SUPPLIES', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-09', description: 'Flight back to NYC', amount: 199.18, category: 'TRANSPORTATION', notes: "Amir's Personal Card. Total for Cleanup Trip approximately $2400" },
  { paidBy: 'Amir', date: '2025-07-11', description: 'Amazon order for spot lights', amount: 43.30, category: 'SUPPLIES', notes: "Amir's Personal Card" },
  { paidBy: 'Amir', date: '2025-07-13', description: 'Amazon order for locks and eucalyptus', amount: 47.89, category: 'SUPPLIES', notes: "Amir's Personal Card" },
  { paidBy: 'ALBORZ', date: '2025-07-15', description: 'First Payment for DJ Booth', amount: 1568.19, category: 'ENTERTAINMENT', notes: "Zelle to Sam's Account" },
  { paidBy: 'ALBORZ', date: '2025-07-29', description: 'BOBBY FOOD 1', amount: 5000.00, category: 'FOOD', notes: null },
  { paidBy: 'ALBORZ', date: '2025-07-30', description: 'Temen Payment 1', amount: 8000.00, category: 'SERVICES', notes: null },
  { paidBy: 'Amir', date: '2025-07-30', description: 'DUES FOR AMIR', amount: 1200.00, category: 'OTHER', notes: 'Take from Amir Balance. Remove from Balance to be paid back to Amir $1503.37 left to pay Amir' },
  { paidBy: 'ALBORZ', date: '2025-08-06', description: 'CES Payment 1', amount: 16207.00, category: 'UTILITIES', notes: 'First Half of Power Paid' },
  { paidBy: 'ALBORZ', date: '2025-08-06', description: 'BOBBY FOOD 2', amount: 5000.00, category: 'FOOD', notes: null },
  { paidBy: 'ALBORZ', date: '2025-08-07', description: 'BOBBY FOOD 3', amount: 5000.00, category: 'FOOD', notes: null },
  { paidBy: 'ALBORZ', date: '2025-08-12', description: 'Sierra Site Services', amount: 6900.00, category: 'UTILITIES', notes: 'Drinking Water Bill' },
  { paidBy: 'Bita', date: '2025-08-17', description: 'Misc Purchases', amount: 682.00, category: 'SUPPLIES', notes: 'Sent to her via Zelle on 9/6/25' },
  { paidBy: 'Amir', date: '2025-08-17', description: 'Reno Airport - Parking', amount: 108.00, category: 'TRANSPORTATION', notes: null },
  { paidBy: 'Amir', date: '2025-08-17', description: 'John Ling', amount: 290.00, category: 'SUPPLIES', notes: 'Venmo for Pillows' },
  { paidBy: 'ALBORZ', date: '2025-08-18', description: 'BOBBY FOOD 4', amount: 5000.00, category: 'FOOD', notes: null },
  { paidBy: 'Amir', date: '2025-08-18', description: 'Costco Reno', amount: 754.57, category: 'FOOD', notes: 'Build Food / Drinks / ETC' },
  { paidBy: 'Amir', date: '2025-08-18', description: 'Grand Sierra', amount: 50.52, category: 'TRANSPORTATION', notes: null },
  { paidBy: 'Amir', date: '2025-08-18', description: 'Trivago', amount: 43.00, category: 'TRANSPORTATION', notes: null },
  { paidBy: 'Amir', date: '2025-08-23', description: 'ICE', amount: 110.40, category: 'SUPPLIES', notes: null },
  { paidBy: 'Amir', date: '2025-08-19', description: 'Grand Sierra Resort Chaleo', amount: 105.04, category: 'TRANSPORTATION', notes: null },
];

// ═══════════════════════════════════════════════════════════════════
// MAPPING HELPERS
// ═══════════════════════════════════════════════════════════════════

type HousingTypeEnum = 'TENT' | 'SHIFTPOD' | 'RV' | 'TRAILER' | 'DORM' | 'SHARED' | 'HEXAYURT' | 'OTHER';
type GenderEnum = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY';
type SeasonMemberStatusEnum = 'INTERESTED' | 'MAYBE' | 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';
type PreApprovalFormEnum = 'YES' | 'MAYBE' | 'NO';

function mapHousing(housing: string | null): HousingTypeEnum | null {
  if (!housing) return null;
  const h = housing.toLowerCase().trim();

  if (h === 'tent') return 'TENT';
  if (h === 'shiftpod') return 'SHIFTPOD';
  if (h === 'rv') return 'RV';
  if (h === 'trailer') return 'TRAILER';
  if (h === 'dorm') return 'DORM';
  if (h === 'shared') return 'SHARED';
  if (h.startsWith('shared w') || h.startsWith('shared with')) return 'SHARED';
  if (h.includes('hexayurt')) return 'HEXAYURT';

  return null;
}

function mapGender(gender: string | null): GenderEnum | null {
  if (!gender) return null;
  if (gender === 'M') return 'MALE';
  if (gender === 'F') return 'FEMALE';
  return null;
}

function mapPreApproval(preApproval: string | null): SeasonMemberStatusEnum {
  if (!preApproval) return 'INTERESTED';
  const p = preApproval.toLowerCase().trim();
  if (p === 'yes') return 'CONFIRMED';
  if (p === 'maybe') return 'MAYBE';
  if (p === 'no') return 'INTERESTED';
  return 'INTERESTED';
}

function mapPreApprovalForm(preApproval: string | null): PreApprovalFormEnum | null {
  if (!preApproval) return null;
  const p = preApproval.toLowerCase().trim();
  if (p === 'yes') return 'YES';
  if (p === 'maybe') return 'MAYBE';
  if (p === 'no') return 'NO';
  return null;
}

function mapBoolFlag(value: string | null): boolean {
  if (!value) return false;
  return value.toUpperCase() === 'Y';
}

function mapAlborzVirgin(value: string | null): boolean {
  if (!value) return false;
  return value.toUpperCase() === 'Y';
}

function mapBmVirgin(value: string | null): boolean {
  if (!value) return false;
  return value.toUpperCase() === 'Y';
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T12:00:00Z');
  if (isNaN(d.getTime())) return null;
  return d;
}

/** Convert dollar amount to cents (integer) */
function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// Determine if a personal expense needs reimbursement
function needsReimbursement(paidBy: string): boolean {
  const p = paidBy.toLowerCase().trim();
  return p !== 'alborz';
}

// ═══════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('========================================');
  console.log(' Camp Alborz Database Seed');
  console.log('========================================\n');

  // Track counts for summary
  let membersCreated = 0;
  let membersUpdated = 0;
  let seasonMembersCreated = 0;
  let expensesCreated = 0;

  // ─────────────────────────────────────────────────
  // 1. HASH THE ADMIN PASSWORD
  // ─────────────────────────────────────────────────
  console.log('[1/7] Hashing admin password...');
  const adminPasswordHash = await bcrypt.hash('p@ssw0rd17', 12);

  // ─────────────────────────────────────────────────
  // 2. CREATE / UPSERT SEASONS
  // ─────────────────────────────────────────────────
  console.log('[2/7] Upserting seasons...');

  const season2025 = await prisma.season.upsert({
    where: { year: 2025 },
    update: {
      name: 'Alborz 2025',
      isActive: false,
      duesAmount: 120000,
      gridFee30amp: 50000,
      gridFee50amp: 100000,
      startDate: new Date('2025-08-24T00:00:00Z'),
      endDate: new Date('2025-09-01T00:00:00Z'),
      buildStartDate: new Date('2025-08-19T00:00:00Z'),
      strikeEndDate: new Date('2025-09-03T00:00:00Z'),
    },
    create: {
      year: 2025,
      name: 'Alborz 2025',
      isActive: false,
      duesAmount: 120000,
      gridFee30amp: 50000,
      gridFee50amp: 100000,
      startDate: new Date('2025-08-24T00:00:00Z'),
      endDate: new Date('2025-09-01T00:00:00Z'),
      buildStartDate: new Date('2025-08-19T00:00:00Z'),
      strikeEndDate: new Date('2025-09-03T00:00:00Z'),
    },
  });
  console.log(`  -> Season 2025: ${season2025.id}`);

  const season2026 = await prisma.season.upsert({
    where: { year: 2026 },
    update: {
      name: 'Alborz 2026',
      isActive: true,
      duesAmount: 120000,
      gridFee30amp: 15000,
      gridFee50amp: 25000,
      startDate: new Date('2026-08-30T00:00:00Z'),
      endDate: new Date('2026-09-07T00:00:00Z'),
      buildStartDate: new Date('2026-08-24T00:00:00Z'),
      strikeEndDate: new Date('2026-09-09T00:00:00Z'),
    },
    create: {
      year: 2026,
      name: 'Alborz 2026',
      isActive: true,
      duesAmount: 120000,
      gridFee30amp: 15000,
      gridFee50amp: 25000,
      startDate: new Date('2026-08-30T00:00:00Z'),
      endDate: new Date('2026-09-07T00:00:00Z'),
      buildStartDate: new Date('2026-08-24T00:00:00Z'),
      strikeEndDate: new Date('2026-09-09T00:00:00Z'),
    },
  });
  console.log(`  -> Season 2026: ${season2026.id}`);

  // ─────────────────────────────────────────────────
  // 3. CREATE / UPSERT ALL 78 MEMBERS
  // ─────────────────────────────────────────────────
  console.log('[3/7] Upserting 78 members...');

  // Map to store email -> member id for later lookups
  const memberIdByEmail = new Map<string, string>();
  const memberIdByName = new Map<string, string>();

  for (const m of membersData) {
    const isAdmin = m.email === 'amirhjalali@gmail.com';

    const member = await prisma.member.upsert({
      where: { email: m.email },
      update: {
        name: m.name,
        gender: mapGender(m.gender),
        dietaryRestrictions: m.dietary || null,
        isActive: true,
        ...(isAdmin ? { passwordHash: adminPasswordHash, role: 'ADMIN', emailVerified: true } : {}),
      },
      create: {
        email: m.email,
        name: m.name,
        gender: mapGender(m.gender),
        role: isAdmin ? 'ADMIN' : 'MEMBER',
        isActive: true,
        emailVerified: isAdmin ? true : false,
        passwordHash: isAdmin ? adminPasswordHash : null,
        dietaryRestrictions: m.dietary || null,
      },
    });

    memberIdByEmail.set(m.email, member.id);
    memberIdByName.set(m.name.toLowerCase(), member.id);

    if (member.createdAt.getTime() === member.updatedAt.getTime()) {
      membersCreated++;
    } else {
      membersUpdated++;
    }
  }

  console.log(`  -> ${membersCreated} created, ${membersUpdated} updated`);

  // ─────────────────────────────────────────────────
  // 4. ENROLL ALL MEMBERS IN 2025 SEASON
  // ─────────────────────────────────────────────────
  console.log('[4/7] Enrolling all 78 members in 2025 season...');

  for (const m of membersData) {
    const memberId = memberIdByEmail.get(m.email)!;
    const status = mapPreApproval(m.preApproval);
    const housingType = mapHousing(m.housing);
    const preApprovalForm = mapPreApprovalForm(m.preApproval);
    const arrivalDate = parseDate(m.arrival);
    const departureDate = parseDate(m.departure);
    const buildCrew = mapBoolFlag(m.build);
    const strikeCrew = mapBoolFlag(m.strike);
    const isAlborzVirgin = mapAlborzVirgin(m.alborzVirgin);
    const isBMVirgin = mapBmVirgin(m.bmVirgin);

    // For housingSize: if the value is "-" or "shared", treat as null
    let housingSize = m.housingSize;
    if (housingSize === '-' || housingSize === 'shared') {
      housingSize = null;
    }

    await prisma.seasonMember.upsert({
      where: {
        seasonId_memberId: {
          seasonId: season2025.id,
          memberId,
        },
      },
      update: {
        status,
        housingType,
        housingSize,
        gridPower: 'NONE',
        arrivalDate,
        departureDate,
        buildCrew,
        strikeCrew,
        preApprovalForm,
        isAlborzVirgin,
        isBMVirgin,
      },
      create: {
        seasonId: season2025.id,
        memberId,
        status,
        housingType,
        housingSize,
        gridPower: 'NONE',
        arrivalDate,
        departureDate,
        buildCrew,
        strikeCrew,
        preApprovalForm,
        isAlborzVirgin,
        isBMVirgin,
      },
    });

    seasonMembersCreated++;
  }

  console.log(`  -> ${seasonMembersCreated} season memberships upserted for 2025`);

  // ─────────────────────────────────────────────────
  // 5. ENROLL AMIR IN 2026 SEASON
  // ─────────────────────────────────────────────────
  console.log('[5/7] Enrolling Amir in 2026 season...');

  const amirId = memberIdByEmail.get('amirhjalali@gmail.com')!;

  await prisma.seasonMember.upsert({
    where: {
      seasonId_memberId: {
        seasonId: season2026.id,
        memberId: amirId,
      },
    },
    update: {
      status: 'CONFIRMED',
    },
    create: {
      seasonId: season2026.id,
      memberId: amirId,
      status: 'CONFIRMED',
    },
  });

  console.log(`  -> Amir enrolled in 2026 as CONFIRMED`);

  // ─────────────────────────────────────────────────
  // 6. CREATE EXPENSES
  // ─────────────────────────────────────────────────
  console.log('[6/7] Creating 42 expenses for 2025 season...');

  // Build a quick name lookup for expense "paidBy" -> display name
  // Map known paidBy names to full display names
  const paidByNameMap: Record<string, string> = {
    'alborz': 'ALBORZ',
    'amir': 'Amir Jalali',
    'bita': 'Bita Mehrjou',
  };

  for (const exp of expensesData) {
    const paidByLower = exp.paidBy.toLowerCase().trim();
    const displayName = paidByNameMap[paidByLower] || exp.paidBy;
    const isPersonal = needsReimbursement(exp.paidBy);

    await prisma.expense.create({
      data: {
        seasonId: season2025.id,
        description: exp.description,
        amount: dollarsToCents(exp.amount),
        paidBy: displayName,
        date: new Date(exp.date + 'T12:00:00Z'),
        category: exp.category,
        needsReimbursement: isPersonal,
        reimbursed: false,
        notes: exp.notes,
      },
    });

    expensesCreated++;
  }

  console.log(`  -> ${expensesCreated} expenses created`);

  // ─────────────────────────────────────────────────
  // 7. FINAL SUMMARY
  // ─────────────────────────────────────────────────
  console.log('\n[7/7] Verifying counts...');

  const totalMembers = await prisma.member.count();
  const totalSeasons = await prisma.season.count();
  const totalSeasonMembers = await prisma.seasonMember.count();
  const totalExpenses = await prisma.expense.count();

  console.log('\n========================================');
  console.log(' SEED COMPLETE - Summary');
  console.log('========================================');
  console.log(`  Members:         ${totalMembers}`);
  console.log(`  Seasons:         ${totalSeasons}`);
  console.log(`  Season Members:  ${totalSeasonMembers}`);
  console.log(`  Expenses:        ${totalExpenses}`);
  console.log('========================================');
  console.log('');
  console.log('Admin login:');
  console.log('  Email:    amirhjalali@gmail.com');
  console.log('  Password: p@ssw0rd17');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
