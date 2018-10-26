<template>
  <div class="input-group input-group-lg padding" :class="isValid">
    <div class="input-group-prepend">
      <button type="button"
              class="btn btn-outline-secondary dropdown-toggle input-prepend-size"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false">
              {{inputValues.activity}}
      </button>
      <div class="dropdown-menu dropdown-size scrollable-dropdown">
        <span :key="activity.id" v-for="activity in activityList">
          <a class="dropdown-item" @click="setActivity(activity)">{{activity.description}}</a>
        </span>
      </div>
    </div>
    <input type="number" 
           name="beginHour"
           class="number-input" 
           :min="checkMin"
           :max="maxValue"
           v-model.lazy="inputValues.start" 
           @change="checkValidity()">
    <input type="number"
           name="endHour"
           class="number-input"
           :min="minValue"
           :max="checkMax"
           v-model.lazy="inputValues.end"
           @change="checkValidity()"
           >
    <button class="remove" @click="removeActivity()">X</button>
  </div>
</template>

<script>
export default {
  name: 'ActivityInput',
  props: {
    inputValues:{
      required: true,
      type: Object
    },
    previousActivity:{
      required: false,
      type: Object
    },

    nextActivity:{
      required: false,
      type: Object
    },
    activityList:{
      required: true,
    }
    
  }, 
  data: function () {
    return {
      activitySelected: "",
      activityInput: {},
      startValue: this.start,
      endValue: this.end
     }
  },
  computed:{

    checkMin(){
      if(this.previousActivity){
        return this.previousActivity.end
      }
      return 0
    },

    checkMax(){
      if(this.nextActivity){
        return this.nextActivity.start
      }
        return 24
    },

    maxValue(){
      return this.inputValues.end -1
    },

    minValue(){
      return Number(this.inputValues.start) + 1
    },

    isValid(){
      if (this.inputValues.valid){
        return ""
      }
      return "danger"
    }
    
  },

  methods: {
    setActivity: function (activity) {
      this.inputValues.activity = activity.description
      this.inputValues.id = activity.id
      this.$emit("verifyInputs")
    },

    checkPrevious(){
      if(this.previousActivity){
        this.activitySelected = this.previousActivity
      }
      else{
        this.activitySelected = "Atividade"
      }
    },

    removeActivity(){
       this.$emit("activityRemoved")
       this.checkValidity()
    },

    checkValidity(){
      let equalPrevious = true
      let equalNext = true
      if(this.previousActivity){
        equalPrevious = (this.inputValues.start == this.previousActivity.end)
      } 
      if(this.nextActivity){
        equalNext = this.inputValues.end == this.nextActivity.start
      }

      if(equalPrevious && equalNext){
        this.inputValues.valid = true
      } else {
        this.inputValues.valid = false
      }
      this.$emit("verifyInputs")
    }

  }
  
}
</script>

<style scoped>
.input-prepend-size {
  width: 785px;
  background-color: white;
}

.input-prepend-size:hover {
  background-color: #6c757d;
}
.dropdown-size {
  width: 785px;
}
.scrollable-dropdown {
  height: auto;
  max-height: 200px;
  overflow-x: hidden;
}
.remove{
  border-color: #dc3545;
  height: 50px;
  width: 50px;
  margin: 0 auto;
  margin-left: 20px;
  background-color: white;
  color:  #dc3545;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  transition: all .3s ease;
}

.remove:hover{
  background-color: #dc3545;
  color: white;
  transition: all .3s ease;

}

.number-input{
  width: 100px;
  font-size: 20px;
  text-align: center;
}

.danger{
  background-color: rgba(255, 0, 0, 0.308);
}

.padding{
  padding: 2px;
  border-radius: 5px;
}
</style>
