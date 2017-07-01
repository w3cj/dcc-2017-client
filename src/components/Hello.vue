<template>
  <div class="container">
    <div class="">
      <h2>Choose a Day</h2>
      <md-button @click.native="selectedDay = 'Friday'; load('2017-06-30')" class="md-raised md-primary">Friday</md-button>
      <md-button @click.native="selectedDay = 'Saturday'; load('2017-07-01')" class="md-raised md-accent">Saturday</md-button>
      <md-button @click.native="selectedDay = 'Sunday'; load('2017-07-02')" class="md-raised md-secondary">Sunday</md-button>
    </div>
    <div v-if="loading">
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
      <md-progress class="md-accent" md-indeterminate></md-progress>
    </div>
    <div v-if="!loading && loaded">
      <h1>{{selectedDay}}</h1>
      <div>
        <md-radio v-model="viewMySchedule" id="my-test1" name="my-test-group1" :md-value="false">All Events</md-radio>
        <md-radio v-model="viewMySchedule" id="my-test2" name="my-test-group1" :md-value="true">My Schedule</md-radio>
      </div>
      <md-input-container>
        <label>Search</label>
        <md-input v-model="search"></md-input>
      </md-input-container>
      <div class="" v-if="!viewMySchedule">
        <h3>Categories</h3>
        <md-button @click.native="selectedCategory = ''" class="md-raised md-primary">All</md-button>
        <md-button v-for="(value, name) in categories" :key="name" @click.native="selectedCategory = name" class="md-raised md-secondary" :class="{'md-accent': selectedCategory == name}">{{name}}</md-button>
      </div>
      <div class="">
        <h3 v-if="hasHiddenVenues">Hidden</h3>
        <md-button v-for="(value, name) in hiddenVenues" :key="name" v-if="value" @click.native="hiddenVenues[name] = false" class="md-raised md-primary">{{name}}</md-button>
      </div>
      <h2>{{selectedCategory}}</h2>
      <section class="venues">
        <div v-for="venue in filteredVenues" class="venue" v-if="!hiddenVenues[venue.name]">
          <md-button @click.native="hiddenVenues[venue.name] = true" class="md-raised md-warn">Hide</md-button>
          <h2>{{venue.name}}</h2>
          <section v-for="startTime in startTimes" class="start-time">
            <h3 :class="{ 'has-events': venue.events[startTime] }">{{startTime}}</h3>
            <section v-if="venue.events[startTime]">
              <div v-for="event in venue.events[startTime]" v-if="!event.hidden">
                <h4>{{event.Schedule.title}}</h4>
                <small>{{event.Schedule.start_time}} - {{event.Schedule.end_time}}</small>
                <md-button class="md-icon-button md-raised" id="custom" @click="openDialog('dialog1', event)">
                  <md-icon>description</md-icon>
                </md-button>
                <md-button v-if="!mySchedule[event.Schedule.id]" @click.native="addToMySchedule(event.Schedule.id)" class="md-icon-button md-raised md-accent">
                  <md-icon>add</md-icon>
                </md-button>
                <md-button v-else @click.native="removeFromMySchedule(event.Schedule.id)" class="md-icon-button md-raised md-primary">
                  <md-icon>done</md-icon>
                </md-button>
              </div>
            </section>
          </section>
        </div>
      </section>
      <md-dialog md-open-from="#custom" md-close-to="#custom" ref="dialog1">
        <md-dialog-title>{{selectedEvent.Schedule.title}}</md-dialog-title>
        <md-dialog-content>
          <div class="guests">
            <div class="guest" v-for="guest in selectedEvent.Guest">
              <img v-if="guest.guest_file_path && guest.guest_file_name" class="event-img" :src="'https://register.growtix.com/attachments/media/med/' + guest.guest_file_path + '/' + guest.guest_file_name" alt="guest">
              <img v-else src="https://register.growtix.com/attachments/media/small/16/34/57/5924d9cb-a114-4cc4-a80a-349bac1c10ea.png" alt="">
              <p>{{guest.first_name}} {{guest.last_name}}</p>
            </div>
          </div>
          <p class="event-description">{{selectedEvent.Schedule.description}}</p>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="closeDialog('dialog1')">Cancel</md-button>
          <md-button class="md-primary" @click="closeDialog('dialog1')">Ok</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>
  </div>
</template>

<script>
import Data from '../lib/Data';

export default {
  name: 'hello',
  data() {
    return {
      selectedDay: '',
      loading: false,
      loaded: false,
      viewMySchedule: false,
      selectedEvent: {
        Schedule: {},
      },
      search: '',
      selectedCategory: '',
      hiddenVenues: localStorage.hiddenVenues ? JSON.parse(localStorage.hiddenVenues) : {},
      venues: [],
      startTimes: [],
      categories: [],
      mySchedule: localStorage.mySchedule ? JSON.parse(localStorage.mySchedule) : {},
    };
  },
  mounted() {
    if (localStorage.date) {
      this.selectedDay = localStorage.selectedDay;
      this.load(localStorage.date);
    }
  },
  computed: {
    hasHiddenVenues() {
      return Object.keys(this.hiddenVenues).some(name => this.hiddenVenues[name]);
    },
    filteredVenues() {
      const regexp = new RegExp(this.search, 'gi');
      const venues = this.venues.filter((venue) => {
        const visibleEvents = Object.keys(venue.events).filter((time) => {
          const events = venue.events[time];
          return events.filter((event) => {
            let match = false;

            if (this.viewMySchedule && this.mySchedule[event.Schedule.id]) {
              if (!this.search || (this.search && event.json.match(regexp))) {
                event.hidden = false;
                match = true;
              } else {
                event.hidden = true;
              }
              return match;
            } else if (this.viewMySchedule && !this.mySchedule[event.Schedule.id]) {
              event.hidden = true;
            } else if (!this.viewMySchedule) {
              if (!this.search || (this.search && event.json.match(regexp))) {
                event.hidden = false;
                match = true;
              } else {
                event.hidden = true;
              }
              return !this.selectedCategory ? match :
                match && event.ScheduleCategory.some(c => c.name.trim() === this.selectedCategory);
            }

            return match;
          }).length > 0;
        });
        return visibleEvents.length > 0;
      });

      return venues;
    },
  },
  methods: {
    openDialog(ref, event) {
      this.selectedEvent = event;
      this.$refs[ref].open();
    },
    closeDialog(ref) {
      this.$refs[ref].close();
    },
    removeFromMySchedule(id) {
      this.$set(this.mySchedule, id, false);
      localStorage.mySchedule = JSON.stringify(this.mySchedule);
    },
    addToMySchedule(id) {
      this.$set(this.mySchedule, id, true);
      localStorage.mySchedule = JSON.stringify(this.mySchedule);
    },
    load(date) {
      localStorage.date = date;
      localStorage.selectedDay = this.selectedDay;
      this.loading = true;
      Promise.all([
        Data.getVenues(),
        Data.getEvents(date),
      ]).then(({ 0: venues, 1: events }) => {
        const allVenues = [];
        const venuesById = {};
        const startTimes = {};
        const hiddenVenues = {};

        venues.forEach(({ VenueLocation: venue }) => {
          allVenues.push(venue);
          hiddenVenues[venue.name] = false;
          venuesById[venue.id] = venue;
          venuesById[venue.id].events = {};
        });

        this.hiddenVenues = hiddenVenues;
        let categories = [];

        events.forEach((event) => {
          const location_id = event.VenueLocation.id;
          event.hidden = false;
          event.json = JSON.stringify(event);
          if (location_id) {
            const start_time = event.Schedule.start_time;
            const venue = venuesById[location_id];

            venue.events[start_time] = venue.events[start_time] || [];
            venue.events[start_time].push(event);
            if (!startTimes[start_time]) {
              this.startTimes.push(start_time);
            }
            startTimes[start_time] = true;
          }

          categories = categories.concat(event.ScheduleCategory.map(c => c.name.trim()));
        });

        this.categories = categories.reduce((all, c) => {
          all[c] = true;
          return all;
        }, {});

        this.venues = allVenues;
        this.loading = false;
        this.loaded = true;
      });
    },
  },
};
</script>

<style>
.container {
  padding: 2em;
  font-size: 1.5em;
}

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
  height: 170px;
  min-width: 400px;
  max-width: 400px;
  overflow: scroll;
}

.event-img {
  display: block;
  width: 70px;
}

.has-events {
  color: #f44336;
}

.event-description {
  white-space: pre-wrap;
}

.guests {
  display: flex;
  flex-wrap: wrap;
}

.guest {
  display: flex;
  flex-direction: column;
  margin: 1em;
  justify-content: center;
  align-items: center;
}

.guest img {
  width: 50px;
  height: auto;
}

.guest p {
  font-size: 1.2em;
}

.md-theme-default.md-input-container.md-input-focused input {
  -webkit-text-fill-color: black;
}
</style>
