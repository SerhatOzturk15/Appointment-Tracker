import knex from "knexClient";

// function gets all events
// we get all results at once and then filter it, to not to hit database more than once
export async function getEvents(startDate) {
  return await knex
    .select("kind", "starts_at", "ends_at", "weekly_recurring")
    .from("events")
    .where(function () {
      this.where("weekly_recurring", true).orWhere("ends_at", ">", +startDate);
    });
}
