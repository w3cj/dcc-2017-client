<template>
  <div>
    <section class="venues">
      <div v-for="venue in venues" class="venue">
        <h2>{{venue.name}}</h2>
        <section v-for="startTime in startTimes" class="start-time">
          <h3 :class="{ 'has-events': venue.events[startTime] }">{{startTime}}</h3>
          <section v-if="venue.events[startTime]">
            <div v-for="event in venue.events[startTime]">
              <h4>{{event.Schedule.title}}</h4>
              <small>{{event.Schedule.start_time}} - {{event.Schedule.end_time}}</small>
              <img v-if="event.Guest[0] && event.Guest[0].guest_file_path" class="event-img" :src="'https://register.growtix.com/attachments/media/small/' + event.Guest[0].guest_file_path + '/' + event.Guest[0].guest_file_name" alt="guest">
            </div>
          </section>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data() {
    return {
      venues: [],
      startTimes: [],
    };
  },
  mounted() {
    this.load();
  },
  methods: {
    load() {
      Promise.all([
        fetch('https://dcc-2017-api.now.sh/api/venue')
          .then(res => res.json()),
        fetch('https://dcc-2017-api.now.sh/api/schedule/2017-07-01')
          .then(res => res.json()),
      ]).then(({ 0: venues, 1: events }) => {
        console.log(events);
        const allVenues = [];
        const venuesById = {};
        const startTimes = {};

        venues.forEach(({ VenueLocation: venue }) => {
          allVenues.push(venue);
          venuesById[venue.id] = venue;
          venuesById[venue.id].events = {};
        });

        events.forEach((event) => {
          const location_id = event.VenueLocation.id;
          const start_time = event.Schedule.start_time;
          const venue = venuesById[location_id];

          venue.events[start_time] = venue.events[start_time] || [];
          venue.events[start_time].push(event);
          if (!startTimes[start_time]) {
            this.startTimes.push(start_time);
          }
          startTimes[start_time] = true;
        });

        this.venues = allVenues;
      });
    },
  },
};
</script>

<style>
.venues {
  display: flex;
  overflow-x: scroll;
  width: 98vw;
  white-space: nowrap;
}

.venue {
  display: inline-block;
  overflow: visible;
  padding: 2em;
}

.start-time {
  height: 150px;
  min-width: 400px;
  max-width: 400px;
  overflow: scroll;
}

.event-img {
  display: block;
  width: 70px;
}

.has-events {
  color: red;
}
</style>
