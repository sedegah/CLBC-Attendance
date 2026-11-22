export interface ChurchEvent {
  id: string;
  date: string;
  title: string;
  time: string;
  startTime: string;
  location: string;
  description: string;
  color: string;
  calendarStart: string;
  calendarEnd: string;
}

export const upcomingEvents: ChurchEvent[] = [
  {
    id: "night-of-worship",
    date: "DEC 04",
    title: "Night of Worship & Prophetic Prayer",
    time: "7:00 PM - 9:30 PM",
    startTime: "7:00 PM",
    location: "Main Sanctuary",
    description:
      "An evening of intimate worship, thanksgiving, and powerful intercession for families and nations.",
    color: "#1F6FB5",
    calendarStart: "20261204T190000",
    calendarEnd: "20261204T213000",
  },
  {
    id: "christmas-outreach",
    date: "DEC 11",
    title: "Annual Community Christmas Outreach",
    time: "10:00 AM - 2:00 PM",
    startTime: "10:00 AM",
    location: "Church Grounds & Community",
    description:
      "Sharing the joy of Christ through food hampers, medical care screening, and children's festivities.",
    color: "#C62828",
    calendarStart: "20261211T100000",
    calendarEnd: "20261211T140000",
  },
  {
    id: "crossroads-youth",
    date: "DEC 18",
    title: "Crossroads Youth & Young Adults Summit",
    time: "5:30 PM - 8:00 PM",
    startTime: "5:30 PM",
    location: "Youth Chapel",
    description:
      "Dynamic panel discussions, praise, and fellowship on navigating faith in today's generation.",
    color: "#1F6FB5",
    calendarStart: "20261218T173000",
    calendarEnd: "20261218T200000",
  },
  {
    id: "christmas-day",
    date: "DEC 25",
    title: "Christmas Day Celebration Service",
    time: "9:00 AM - 11:30 AM",
    startTime: "9:00 AM",
    location: "Main Sanctuary",
    description:
      "Celebrating the birth of our Savior Jesus Christ with choir carols, family dedication, and the Word.",
    color: "#C62828",
    calendarStart: "20261225T090000",
    calendarEnd: "20261225T113000",
  },
  {
    id: "crossover-service",
    date: "DEC 31",
    title: "New Year's Eve Crossover Service",
    time: "9:00 PM - 12:30 AM",
    startTime: "9:00 PM",
    location: "Main Sanctuary & Overflow",
    description:
      "Crossing over into the new year with gratitude, covenant prayers, and divine direction.",
    color: "#0F3E6B",
    calendarStart: "20261231T210000",
    calendarEnd: "20270101T003000",
  },
];

export const getGoogleCalendarUrl = (event: ChurchEvent) => {
  const details = `${event.description} — Changed Life Baptist Church, Ashongman Estate, Accra, Ghana.`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${event.calendarStart}/${event.calendarEnd}`,
    details,
    location: `${event.location}, Changed Life Baptist Church, Ashongman Estate, Accra, Ghana`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
