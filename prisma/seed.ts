import { City, PrismaClient, Regulator } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

const NEXA_NAME = "Nexa Law Limited";
const NEXA_REGULATOR: Regulator = Regulator.SRA;
const NEXA_NUMBER = "633024";

const BRISTOL_OUTWARD = [
  "BS1",
  "BS2",
  "BS3",
  "BS4",
  "BS5",
  "BS6",
  "BS7",
  "BS8",
  "BS9",
  "BS10",
  "BS11",
  "BS13",
  "BS14",
  "BS15",
  "BS16",
];

async function main() {
  const organisation = await prisma.organisation.upsert({
    where: { slug: "mind-the-move" },
    update: { name: "Mind the Move Ltd" },
    create: {
      name: "Mind the Move Ltd",
      slug: "mind-the-move",
    },
  });

  const nexa = await prisma.firm.upsert({
    where: {
      regulator_regulatorNumber: {
        regulator: NEXA_REGULATOR,
        regulatorNumber: NEXA_NUMBER,
      },
    },
    update: {
      name: NEXA_NAME,
      listed: true,
      clientMoneyOk: true,
      diligenceNotes:
        "Phase 1 authorised firm on the matter. Diligence recorded at seed. Register presence alone is not treated as a publish gate.",
      diligencePassedAt: new Date(),
    },
    create: {
      name: NEXA_NAME,
      regulator: NEXA_REGULATOR,
      regulatorNumber: NEXA_NUMBER,
      listed: true,
      clientMoneyOk: true,
      diligenceNotes:
        "Phase 1 authorised firm on the matter. Diligence recorded at seed. Register presence alone is not treated as a publish gate.",
      diligencePassedAt: new Date(),
    },
  });

  const existingListing = await prisma.listing.findFirst({
    where: { firmId: nexa.id, city: City.BRISTOL },
  });

  if (existingListing) {
    await prisma.listing.update({
      where: { id: existingListing.id },
      data: {
        active: false,
        postcodeOutwardCodes: BRISTOL_OUTWARD,
      },
    });
  } else {
    await prisma.listing.create({
      data: {
        firmId: nexa.id,
        city: City.BRISTOL,
        postcodeOutwardCodes: BRISTOL_OUTWARD,
        active: false,
      },
    });
  }

  const adminUserId = process.env.ADMIN_USER_ID?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (adminUserId && adminEmail) {
    await prisma.user.upsert({
      where: { id: adminUserId },
      update: {
        email: adminEmail,
        role: "OPS_ADMIN",
        organisationId: organisation.id,
      },
      create: {
        id: adminUserId,
        email: adminEmail,
        role: "OPS_ADMIN",
        organisationId: organisation.id,
      },
    });
  }

  const reviewCount = await prisma.review.count();
  const listedFirms = await prisma.firm.findMany({
    where: { listed: true },
    select: { name: true, regulator: true, regulatorNumber: true },
  });

  // PLC / any other firm must not appear as listed from this seed.
  const listedNames = listedFirms.map((firm) => firm.name);

  const publicListings = await prisma.listing.count({
    where: { active: true, city: City.BRISTOL },
  });

  const waitlistCount = await prisma.waitlistSignal.count();

  console.log("Seed complete.");
  console.log(`Organisation: ${organisation.name} (${organisation.slug})`);
  console.log(
    `Ops firms (not public copy): ${listedNames.join(", ") || "(none)"} — expected: ${NEXA_NAME} only`,
  );
  console.log(
    `Active Bristol listings: ${publicListings} — expected: 0 for the consumer soft-test`,
  );
  console.log(`Review rows: ${reviewCount} — expected: 0 at cold start`);
  console.log(`Waitlist signals: ${waitlistCount} — seed does not insert interest rows`);
  if (adminUserId && adminEmail) {
    console.log("Ops admin user linked from ADMIN_USER_ID.");
  } else {
    console.log(
      "No ops admin linked. Create a Supabase Auth user, then set ADMIN_USER_ID and ADMIN_EMAIL and re-run seed.",
    );
  }
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown seed error";
    console.error("seed_failed", message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
