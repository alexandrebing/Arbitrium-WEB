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
        <button @click="weekFactory">semana teste</button>
        <button @click="manoWeek">semana Mano</button>
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
      modalTxt: "Deseja desistir da sessão?",
      leftBtnModal: "Não",
      rightBtnModal: "Sim"
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

    weekFactory(){
      if(confirm("Inserir semana teste?")){
        this.createWeekFactory()
        for(let i = 0; i < 7; i++){
          this.validDay[i] = true
        }
        this.validWeek = true
      }
    },

    createWeekFactory(){
      this.activities = [[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 8,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 13,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 13,
              end: 18,
              valid: true
            },
            {
              activity: "Cuidados Pessoais",
              id: 15,
              start: 18,
              end: 19,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 19,
              end: 20,
              valid: true
            },
            {
              activity: "Lazer com Cônjuge e Filho",
              id: 6,
              start: 20,
              end: 24,
              valid: true
            },],[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 6,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 6,
              end: 7,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 7,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 13,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 13,
              end: 17,
              valid: true
            },
            {
              activity: "Tarefas Domésticas",
              id: 10,
              start: 17,
              end: 19,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 19,
              end: 20,
              valid: true
            },
            {
              activity: "Lazer com Cônjuge e Filho",
              id: 6,
              start: 20,
              end: 24,
              valid: true
            },],[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 8,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 13,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 13,
              end: 18,
              valid: true
            },
            {
              activity: "Happy Hour",
              id: 11,
              start: 18,
              end: 24,
              valid: true
            }],[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 8,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 13,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 13,
              end: 18,
              valid: true
            },
            {
              activity: "Hora Extra",
              id: 2,
              start: 18,
              end: 20,
              valid: true
            },
            {
              activity: "Cuidados Pessoais",
              id: 15,
              start: 20,
              end: 21,
              valid: true
            },
            {
              activity: "Lazer com Cônjuge e Filho",
                id: 6,
                start: 21,
                end: 24,
                valid: true
            }],[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 8,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 13,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 13,
              end: 18,
              valid: true
            },
            {
              activity: "Lazer amigos",
              id: 8,
              start: 18,
              end: 21,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 21,
              end: 22,
              valid: true
            },
            {
              activity: "Lazer com Cônjuge e Filho",
              id: 6,
              start: 22,
              end: 23,
              valid: true
            },
            {
              activity: "Lazer com Cônjuge",
              id: 5,
              start: 23,
              end: 24,
              valid: true
            }],[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 11,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 11,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 14,
              valid: true
            },{
              activity: "Dormir",
              id: 1,
              start: 14,
              end: 17,
              valid: true
            },
            {
              activity: "Lazer com filho",
              id: 4,
              start: 17,
              end: 19,
              valid: true
            },
            {
              activity: "Comer",
                id: 3,
                start: 19,
                end: 20,
                valid: true
            },
            {
              activity: "Momento com a família de origem do cônjuge",
              id: 13,
              start: 20,
              end: 24,
              valid: true
            }],[{
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 11,
              valid: true
            },{
              activity: "Momento com a família de origem",
              id: 12,
              start: 11,
              end: 13,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 13,
              end: 14,
              valid: true
            },{
              activity: "Dormir",
              id: 1,
              start: 14,
              end: 17,
              valid: true
            },
            {
              activity: "Lazer sozinho",
              id: 7,
              start: 17,
              end: 19,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 19,
              end: 20,
              valid: true
            },
            {
              activity: "Lazer com cônjuge e filho",
              id: 6,
              start: 20,
              end: 23,
              valid: true
            },{
              activity: "Lazer com cônjuge",
              id: 5,
              start: 23,
              end: 24,
              valid: true
            }]
            ]
            //Ufa
    },

    manoWeek(){
      if(confirm("Criar semana da Mano?")){
        this.activities = [[{ //SEGUNDA
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 8,
              end: 9,
              valid: true
            },{
              activity: "Deslocamento trabalho",
              id:16,
              start:9,
              end: 10,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 10,
              end: 13,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 13,
              end: 14,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 14,
              end: 20,
              valid: true
            },
            {
              activity: "Deslocamento Trabalho",
              id: 16,
              start: 20,
              end: 21,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 21,
              end: 22,
              valid: true
            },
            {
              activity:"Lazer com Cônjuge",
              id: 5,
              start: 22,
              end: 24,
              valid: true
            }],[{ //TERÇA
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 8,
              end: 9,
              valid: true
            },{
              activity: "Deslocamento trabalho",
              id:16,
              start:9,
              end: 10,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 10,
              end: 13,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 13,
              end: 14,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 14,
              end: 21,
              valid: true
            },
            {
              activity: "Deslocamento Trabalho",
              id: 16,
              start: 21,
              end: 22,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 22,
              end: 23,
              valid: true
            },
            {
              activity:"Lazer sozinho",
              id: 7,
              start: 23,
              end: 24,
              valid: true
            }],[ //QUARTA
            {
              activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 8,
              end: 9,
              valid: true
            },{
              activity: "Deslocamento trabalho",
              id:16,
              start:9,
              end: 10,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 10,
              end: 13,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 13,
              end: 14,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 14,
              end: 20,
              valid: true
            },
            {
              activity: "Deslocamento Trabalho",
              id: 16,
              start: 20,
              end: 21,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 21,
              end: 22,
              valid: true
            },
            {
              activity:"Lazer sozinho",
              id: 7,
              start: 22,
              end: 23,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 23,
              end: 24,
              valid: true
            }],[{ //QUINTA
            activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 8,
              end: 9,
              valid: true
            },{
              activity: "Deslocamento trabalho",
              id:16,
              start:9,
              end: 10,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 10,
              end: 13,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 13,
              end: 14,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 14,
              end: 22,
              valid: true
            },
            {
              activity: "Deslocamento Trabalho",
              id: 16,
              start: 22,
              end: 23,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 23,
              end: 24,
              valid: true
            }],[{ //SEXTA
            activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 7,
              end: 8,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 8,
              end: 9,
              valid: true
            },{
              activity: "Deslocamento trabalho",
              id:16,
              start:9,
              end: 10,
              valid: true
            },{
              activity: "Trabalho",
              id: 2,
              start: 10,
              end: 13,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 13,
              end: 14,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 14,
              end: 19,
              valid: true
            },
            {
              activity: "Deslocamento Trabalho",
              id: 16,
              start: 19,
              end: 20,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 20,
              end: 21,
              valid: true
            },
            {
              activity:"Lazer com Cônjuge",
              id: 5,
              start: 21,
              end: 24,
              valid: true
            }],[{ //SABADO
            activity: "Dormir",
              id: 1,
              start: 0,
              end: 7,
              valid: true
            },{
              activity: "Cuidados Pessoais",
              id: 15,
              start: 7,
              end: 9,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 9,
              end: 10,
              valid: true
            },{
              activity: "Lazer com Cônjuge",
              id:5,
              start:10,
              end: 12,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 12,
              end: 14,
              valid: true
            },
            {
              activity: "Lazer sozinho",
              id: 7,
              start: 14,
              end: 16,
              valid: true
            },
            {
              activity: "Lazer com amigos",
              id: 8,
              start: 16,
              end: 20,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 20,
              end: 21,
              valid: true
            },
            {
              activity:"Lazer com Cônjuge",
              id: 5,
              start: 21,
              end: 24,
              valid: true
            }],[{//DOMINGO
            activity: "Dormir",
              id: 1,
              start: 0,
              end: 9,
              valid: true
            },{
              activity: "Comer",
              id: 3,
              start: 9,
              end: 10,
              valid: true
            },{
              activity: "Lazer com Cônjuge",
              id:5,
              start:10,
              end: 13,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 13,
              end: 15,
              valid: true
            },
            {
              activity: "Trabalho",
              id: 2,
              start: 15,
              end: 18,
              valid: true
            },
            {
              activity: "Lazer com Cônjuge",
              id: 5,
              start: 18,
              end: 21,
              valid: true
            },
            {
              activity: "Comer",
              id: 3,
              start: 21,
              end: 22,
              valid: true
            },
            {
              activity:"Cuidados Pessoais",
              id: 15,
              start: 22,
              end: 23,
              valid: true
            },{
              activity:"Tarefas Domésticas",
              id: 10,
              start: 23,
              end: 24,
              valid: true
            }]
          ]
        for(let i = 0; i < 7; i++){
          this.validDay[i] = true
        }
        this.validWeek = true
      }
    },

    listActivitiesLog(){
      let parsedActivities = JSON.stringify(this.activities)
      console.log(parsedActivities)
    }
    
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
