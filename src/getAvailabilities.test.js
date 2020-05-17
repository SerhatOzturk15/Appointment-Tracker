import knex from "knexClient";
import getAvailabilities from "./getAvailabilities";

describe("getAvailabilities", () => {
  beforeEach(() => knex("events").truncate());

  describe("should get the slot numbers correctly", () => {
    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);
      for (let i = 0; i < 7; ++i) {
        expect(availabilities[i].slots).toEqual([]);
      }
    });
  });
  

  describe("recurring test case should work correctly", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00"
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("it should handle appointments at night time correctly", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 22:30"),
          ends_at: new Date("2014-08-12 01:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 21:30"),
          ends_at: new Date("2014-08-05 02:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("it should get the times in the start of opening day correctly", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "21:30",
        "22:00"
      ]);       
      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });

    it("it should get the times in the day after of opening day correctly", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );

      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[2].date)).toBe(
        String(new Date("2014-08-12"))
      );     

      expect(availabilities[2].slots).toEqual([
        "1:30",
        "2:00"
      ]);      

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("it should handle date and time(year etc) correctly", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2018-08-04 09:30"),
          ends_at: new Date("2018-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[6].slots).toEqual([]);
    });
  });

  describe("when multiple appointments occur on the same day", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 11:30"),
          ends_at: new Date("2014-08-11 12:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 13:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "12:30",
        "13:00"
      ]);

      expect(String(availabilities[6].date)).toBe(
        String(new Date("2014-08-16"))
      );
    });
  });

  describe("no appointments booked in that day", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-09-11 10:30"),
          ends_at: new Date("2014-09-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 13:00"),
          weekly_recurring: true
        }
      ]);
    });

    it("test 1", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-10"));
      expect(availabilities.length).toBe(7);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[1].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[1].slots).toEqual([
        "9:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30"
      ]);
    });
  });

  describe("when numberofDays is more than 7", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-18 10:30"),
          ends_at: new Date("2014-08-18 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-25 10:30"),
          ends_at: new Date("2014-08-25 11:30")
        },
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-04 09:30"),
          ends_at: new Date("2014-08-04 12:30"),
          weekly_recurring: true
        }
      ]);
    });

    it("checks weekly occurings", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-08"), 40);
      expect(availabilities.length).toBe(40);

      expect(String(availabilities[2].date)).toBe(
        String(new Date("2014-08-10"))
      );
      expect(availabilities[0].slots).toEqual([]);

      expect(String(availabilities[3].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[3].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00",
      ]);
      expect(String(availabilities[10].date)).toBe(
        String(new Date("2014-08-18"))
      );
      expect(availabilities[10].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00",
      ]);
       expect(String(availabilities[17].date)).toBe(
         String(new Date("2014-08-25"))
       );
       expect(availabilities[17].slots).toEqual([
         "9:30",
         "10:00",
         "11:30",
         "12:00",
       ]);
    });
  });
  describe("when numberofDays is more than 7", () => {
    beforeEach(async () => {
      await knex("events").insert([
        {
          kind: "appointment",
          starts_at: new Date("2014-08-11 10:30"),
          ends_at: new Date("2014-08-11 11:30")
        },
        {
          kind: "opening",
          starts_at: new Date("2014-08-11 09:30"),
          ends_at: new Date("2014-08-11 12:30"),
          weekly_recurring: false
        }
      ]);
    });

    it("if there is no weekly occurings", async () => {
      const availabilities = await getAvailabilities(new Date("2014-08-11"), 25);
      expect(availabilities.length).toBe(25);

      expect(String(availabilities[0].date)).toBe(
        String(new Date("2014-08-11"))
      );
      expect(availabilities[0].slots).toEqual([
        "9:30",
        "10:00",
        "11:30",
        "12:00",
      ]);

      expect(String(availabilities[7].date)).toBe(
        String(new Date("2014-08-18"))
      );
      expect(availabilities[7].slots).toEqual([]);

    });
  });
});
