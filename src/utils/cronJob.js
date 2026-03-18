const { subDays, startOfDay, endOfDay } = require("date-fns");
const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequestSchema");
const sendEmail = require("./sendEmail");

//sending friend request reminder emails from yesterday, every day at 10:00 AM
cron.schedule("0 10 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);

    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    })
      .populate({ path: "toUserId", select: "email" })
      .populate("fromUserId")
      .select("email");

    const listOfToEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId?.email)),
    ];
    for (const email of listOfToEmails) {
      try {
        await sendEmail.run(
          "You got pending request on StackMates platform for this email acccount: " +
            email,
          "There are lot of people who are interested in you, give them your response by accepeting or rejecting their freind requests.",
        );
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    console.error(err.message);
  }
});
