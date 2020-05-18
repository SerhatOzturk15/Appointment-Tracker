import moment from "moment";
import { getEvents } from "./data";
import { DATE_FORMAT, TIME_FORMAT, DATE_TIME_FORMAT } from "./constants";

//initialize calendar for interval
function initializeDays(startDate, numberOfDays) {
  let calendar = [];
  for (let day = 0; day < numberOfDays; ++day) {
    let currDay = startDate.clone().add(day, "days").format(DATE_FORMAT);
    calendar.push({ date: new Date(currDay), slots: [] });
  }
  return calendar;
}

export default async function getAvailabilities(start_date, numberOfDays = 7) {
  let startDate = moment(start_date).startOf("day");
  let endDate = startDate.clone().add(numberOfDays, "days");
  let availabilities = initializeDays(startDate, numberOfDays);
  let allEvents = await getEvents(startDate);
  let fetchedAppointments = allEvents.filter(
    (event) => event.kind === "appointment"
  );
  let fetchedOpenings = allEvents.filter((event) => event.kind === "opening");
  let appointments = calculateTimes(fetchedAppointments, startDate, endDate);
  let openings = calculateTimes(fetchedOpenings, startDate, endDate);
  calculateAvailabilities(
    appointments,
    openings,
    startDate,
    availabilities
  );
  return availabilities;
}

// calculating all times by checking start and end dates, recurrings etc.
function calculateTimes(events, startDate, endDate) {
  let calculatedTimes = {};
  for (let i = 0; i < events.length; i++) {
    let startTime = moment(events[i].starts_at);
    let endTime = moment(events[i].ends_at);
    if (!events[i].weekly_recurring) {
      addTimes(calculatedTimes, startTime, endTime, startDate, endDate);
    } else {
      // if recurring, calculates start date
      if (endTime < startDate) {
        //calculates week count for start
        let weekCount = startDate.diff(endTime, "weeks") + 1;
        startTime.add(weekCount, "weeks");
        endTime.add(weekCount, "weeks");
      }
      // checking week by week
      while (startTime < endDate) {
        addTimes(calculatedTimes, startTime, endTime, startDate, endDate);
        startTime.add(1, "weeks");
        endTime.add(1, "weeks");
      }
    }
  }
  return calculatedTimes;
}

// calculates the start and end time for interval. add the times by iteration
function addTimes(calculatedTimes, starts_at, ends_at, startDate, endDate) {
  let start = moment.max(starts_at, startDate);
  let end = moment.min(ends_at, endDate);
  let interval = end.diff(start, "minutes");
  for (let iter = 0; iter < interval; iter += 30) {
    let time = start.clone().add(iter, "minutes");
    calculatedTimes[time.format(DATE_TIME_FORMAT)] = time;
  }
}

//gets appointments and openings as parameters and return availabilities
//checks if there is appoinment in opening time, otherwise add it to the result
function calculateAvailabilities(
  appointments,
  openings,
  startDate,
  availabilities
) {
  for (let time in openings) {
    if (openings.hasOwnProperty(time)) {
      if (!appointments[time]) {
        let days = openings[time].diff(startDate, "days");
        availabilities[days].slots.push(openings[time].format(TIME_FORMAT));
      }
    }
  }
}
