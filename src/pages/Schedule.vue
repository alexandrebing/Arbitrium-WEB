<template>
  <div class="container">
    <!-- TITLE -->
    <div class="row">
      <div class="col-md-1">
        <p>Serial: {{interviewId}}</p>
      </div>
      <div class="col-md-10">
        <h5>Semana {{week}}</h5>
        <h5>Insira suas atividades diárias</h5>
        <p v-if="alert" class="alert alert-warning">{{alert}}</p>
      </div>
      <div class="col-md-1">
        <router-link to="/fim">
            <button class="btn btn-outline-danger">DESISTIR</button>
        </router-link>
      </div>
    </div>
    <!-- SCHEDULE -->
    <div class="row align-items-center mt-5 mb-1">
      <carousel class="col pt-2 pb-2" :per-page="1" :mouse-drag="true" :navigation-enabled="true">
        <slide class="carousel-wrapper" :key="day" v-for="day in days.length">
          <DaySchedule 
          :activities="activities[day-1]"
          :day="days[day-1]"
          :dayIndex="day-1"
          :hasPreviousWeek="hasPreviousWeek"
          @activityAdded="addActivity($event)"
          @activityRemoved="removeActivity($event)"
          @copyPreviousDay="copyPreviousDay($event)"
          @validDay="validDay($event)"
          @invalidDay="invalidDay($event)"></DaySchedule>
        </slide>
      </carousel>
    </div>
    <div v-if="validWeek" class="col-md-2 ml-27">
      <div class="input-group input-group-lg">
        <button type="button" @click="adaptAndCreateWeek()" class="btn btn-primary btn-week" >Iniciar simulação</button>
      </div>
    </div>
  </div>
</template>

<script>
// Vue carousel for each day in the schedule
import { Carousel, Slide } from 'vue-carousel'
import { getAll as getActivities } from '../services/activity'
import { create } from '../services/week'
import DaySchedule from '../components/DaySchedule'
import _ from "underscore"

export default {
  name: 'Schedule',
  components: {
    DaySchedule,
    Carousel,
    Slide
  },
  
  data: () => {
    return {
      isSunday: false,
      days: ['Segunda-Feira','Terça-Feira','Quarta-Feira','Quinta-Feira','Sexta-Feira','Sábado','Domingo'],
      validDays: [false, false, false, false, false, false, false],
      validWeek: false,
      activitiesByDay: new Array(7),
      interviewId: null,
      scheduleId: null,
      weekActivities:{
        dayActivities:[]
      },
      relationship: {
        dayActivities: [],
      },
      week: sessionStorage.getItem('weekCounter') || 1,
      countHoursInDay: {},
      canStart: false,
      alert: "",
      activities:[[{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }],[{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }],[{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }],
            [{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }],
            [{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }],
            [{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }],
            [{
                activity: "Atividade",
                id: 0,
                start: 0,
                end: 1,
                valid: true,
                selected: false
            }]
            ],

      hasPreviousWeek: false,
    }
  },

  mounted() {
    this.getInterviewId()
    this.getScheduleId()
    let lastWeekSchedule = JSON.parse(sessionStorage.getItem('previousWeek')) || ""
    //checks if this is the first week in session or not, to get the last week schedule in case it exists
    if(lastWeekSchedule){
      this.activities = lastWeekSchedule
      this.validDays = [true, true, true, true, true, true, true]
      this.validWeek = true
      this.hasPreviousWeek = true
      }
  },

  methods: {
    
    getInterviewId: function () {
      this.interviewId = sessionStorage.getItem('interview') || 0
    },
    
    getScheduleId: function () {
      this.scheduleId = sessionStorage.getItem('schedule') || 0
    },

    addActivity(data){
      let index = data.index
      if(!data.activity){
        data.activity = "Atividade"
        data.newActivityId = 0
      }           
      this.activities[index].push({
        activity:data.activity,
        start: data.newActivityStart,
        end: data.newActivityEnd,
        id: data.newActivityId,
        valid: true,
        selected: true
      })
    },

    removeActivity(data){
      let dayIndex = data.day
      let positionIndex = data.position
      this.activities[dayIndex].splice(positionIndex, 1)
    },

    adaptAndCreateWeek(){
      //adapts the activities Array to a 24/7 Array, then creates week in DB
      for (let i = 0; i < 7; i++){
        this.activitiesByDay[i]={
          day_number: i+1,
          hours: new Array(24)
        }
        this.setDayActivities(i)
      }
      this.relationship = {
        "schedule_id": this.scheduleId,
        "week_number": this.week,
        "days": this.activitiesByDay
      }
      sessionStorage.setItem('previousWeek',JSON.stringify(this.activities))

      this.createWeek()
    },

    setDayActivities(dayIndex){
      //make 24h array
      for(let i = 0; i < 24; i++){
        let newActivity = this.returnActivityByHour(i, dayIndex)
        this.activitiesByDay[dayIndex].hours[i] = newActivity
      }
    },

    returnActivityByHour(activityHour, dayIndex){
      let currentDayActivities = this.activities[dayIndex]
      let dayLength = currentDayActivities.length
      for(let i = 0; i < dayLength; i++){
        let activity = currentDayActivities[i]          
        if(activity.start <= activityHour && activity.end > activityHour){
          return {
            activity_id: activity.id,              
            hour_number: activityHour
          }
        }
      }
      console.log("some error has occurred while getting activities by hour of day " + dayIndex)
      return {
        activity_id: "null",
        hour_number: "null"
      }
    },

    createWeek: function () {
      this.alert = null
      //API function to send data to DB
      create(this.relationship)
      .then(res => {
        if (res.status === 200) {
          this.$router.push('evento')
        } else {
          console.error("Erro ao criar agenda. ", res)
        }
      })
      .catch(err => {
        console.error("Erro ao criar agenda. ", err.response)
        this.alert = "Por favor,verifique se todos os dias tem 24 Horas e selecione novamente a ultima atividade de Domingo"
      })
    },

    pageChange: function (day) {
      if (day >= 6 ) {
        this.isSunday = true
        this.verifyHour()
      }
      else{ 
        this.isSunday = false;
      }  
    },

    //allows user to copy his previous day, so he can adjust it faster
    copyPreviousDay(dayIndex){
      if(this.activities[dayIndex-1]){
        if(confirm("Tem certeza que deseja copiar a agenda de " + this.days[dayIndex-1])){
          this.copyAllActivities(dayIndex, dayIndex - 1)          
        }
      }
    },

    copyAllActivities(currentDayIndex, previousDayIndex){
      let activitiesLength = this.activities[currentDayIndex].length
      this.activities[currentDayIndex].splice(0,activitiesLength)  
      for(let i = 0; i < this.activities[previousDayIndex].length; i++){
        let activityToAdd = {
              activity: this.activities[previousDayIndex][i].activity,
              newActivityStart: this.activities[previousDayIndex][i].start,
              newActivityEnd: this.activities[previousDayIndex][i].end,
              newActivityId: this.activities[previousDayIndex][i].id,
              index: currentDayIndex
        }    
        this.addActivity(activityToAdd)
      }
     },

    validDay(index){
      this.validDays[index] = true
      this.verfyWeek()
    },

    invalidDay(index){
      this.validDays[index] = false
      this.validWeek = false
    },

    verfyWeek(){
      for(let i = 0; i < 7; i++){
        if(!this.validDays[i]){
          this.validWeek = false
          return
        }
    }
    this.validWeek = true

    },
  }
}
</script>

<style scoped>
.ml-27 {
  margin-left: 27.1rem;
}
.btn-week {
  font-size: 26px;
  padding: 10px;
}
.carousel-wrapper {
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
