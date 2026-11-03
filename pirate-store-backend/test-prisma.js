const prisma = require("../pirate-store-backend/config/prisma");

async function test() {
  try {
    const users = await prisma.user.findMany();

    console.log(users);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();