<template>
  <div class="container">
    <h5>{{day}} <img v-if="allChecked" src="../assets/green-check.png" alt="ok" height="20px" /></h5>

    <div class="container">
      <div class="row mt-4 p-2 bg-secondary text-white border border-secondary rounded shadow-sm">
        <div class="header text">Atividade</div>
        <div class="header number">Inicio</div>
        <div class="header number">Fim</div>
        <div class="header button"></div>
      </div>
    </div>

    <div class="min-height">

    <div class="row mt-1" :key="position" v-for="position in activities.length">
      <div class="col-md-12">
        <ActivityInput class="mt-1 red"
        @activityInput="registerInput($event)"
        @changedEndHour="hoursManager(position, $event);"
        @activityRemoved="removeActivity(position-1)"
        @verifyInputs="verifyInputs(position-1)"
        :inputValues="activities[position-1]"
        :previousActivity="activities[position-2]"
        :nextActivity="activities[position]"
        :activityList="activityList">
        </ActivityInput>
      </div>
    </div>

    </div>

    <div class="row mt-4 mb-5">
      <div class="col-md-5">
        <div class="input-group input-group-lg">
          <button type="button" @click="addActivity()" class="btn btn-outline-primary mr-2">Adicionar atividade</button>
        </div>
      </div>
      <button class="btn btn-outline-primary" @click="copyPreviousDay()">Repetir dia anterior</button>
    </div>
  </div>
</template>

<script>
import _ from "underscore"
import ActivityInput from '../components/ActivityInput'
import { getAll as getActivities } from '../services/activity'

export default {
  name: 'DaySchedule',
  props:{
    day:{
      required: true,
      type: String
    },
    activities:{
      required: true,
      type: Array
    },
    dayIndex:{
      required: true,
      type: Number
    },
    hasPreviousWeek:{
      required: true,
      type: Boolean
    }
    //['day'],//Make activities a list passed as prop
    
  }, 
  
  components: {
    ActivityInput,
  },

  data: () => {
    return {
      activityList: [],
      allChecked: false
    }
  },

  mounted() {
    this.getAllActivities()
    console.log(this.activities)
    if(this.hasPreviousWeek){
      console.log("Há semana anterior")
      this.allChecked = true
    }
    // this.checkRepeatedDay()
  },

  methods: {

    getAllActivities: function () {
  
      getActivities()
      .then(res => {
        this.activityList = res.data
      })
      .catch(err => {
        console.error('DaySchedule, getActivies() ', err)
      })
    },
    
    addActivity(){
      let lastActivityIndex = this.activities.length - 1
        if(this.activities[lastActivityIndex].end >= 24){
          alert("Não é possível adicionar atividades após as 24h, vá para o próximo dia")
          return
        }
        let lastActivity=this.activities[lastActivityIndex]
        let data = {
          index: this.dayIndex,
          newActivityStart: lastActivity.end,
          newActivityEnd: Number(lastActivity.end) + 1,
        }
        this.$emit("activityAdded", data)
        this.verifyInputs(lastActivityIndex + 1)
    },

    removeActivity(index){
      if(this.activities.length == 1){
        alert("Os dias precisam ter pelo menos uma atividade!")
        return        
      }
      let data = {
        day: this.dayIndex,
        position: index
      }
      this.$emit("activityRemoved", data)
      this.verifyInputs(index - 1)
    },

    copyPreviousDay(){
      this.$emit("copyPreviousDay", this.dayIndex)
      this.checkDayCompletition()
    },

    verifyAllInputs(){
      let length = this.activities.length
      for(let i = 0; i < length; i++){
        this.verifyInputs(i)
      }
    },

    verifyInputs(index){
      let currentActivity = this.activities[index]
      let nextActivity = this.activities[index + 1]
      let previousActivity = this.activities[index - 1]
      if(currentActivity.id === 0){
        return
      }
      //verify with previous activity
      if(previousActivity){
        if(currentActivity.start != previousActivity.end){
          console.log(currentActivity)
          previousActivity.valid = false
        } else {
          previousActivity.valid = true
        }
      }
      //verify with next activity
      if(nextActivity){
        if (currentActivity.end != nextActivity.start){
          nextActivity.valid = false
        } else {
          nextActivity.valid = true
        }
      }
      this.checkDayCompletition()
    },

    checkDayCompletition(){
      let lastActivityIndex = this.activities.length - 1
      if (this.activities[0].start == 0 && this.activities[lastActivityIndex].end == 24){
        for (let i = 0; i < lastActivityIndex; i++){
          if (!this.activities[i].valid){
            this.allChecked = false
            this.$emit("invalidDay", this.dayIndex)
            return
          }
        }
        this.allChecked = true;
        this.$emit("validDay", this.dayIndex)
      } else {
        this.allChecked = false;
        this.$emit("invalidDay", this.dayIndex)
      }
    }

  }
}
</script>

<style scoped>

.header{
  font-size: 20px;
  text-align: center;
}

.text{
  width:750px;
}

.number{
  margin-left: 10px;
  width: 100px;
}

.button{
  width: 80px;
  text-align: right;

}

.min-height{
  height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
}
.pr-6 {
  padding-right: 6rem;
}
.pr-7 {
  padding-right: 6.8rem;
}
.pl-10 {
  padding-left: 10rem;
}
.pl-6 {
  padding-left: 6.5rem;
}
#remove-button{
  vertical-align:middle;
  margin-left: 425px;
}
</style>
