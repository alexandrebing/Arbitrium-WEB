<template>
  <transition name="modal"> 
    <div class="modal-mask">
      <div class="floating-div">
        <div>
          <div>
            <p class="event-txt">{{boxText}}</p>
          </div>
        </div>
        <slot>
        
        </slot>    
        <div class="answers-div">
          <button class="btn btn-outline-primary btn-ans" @click="postAnswear(ansOne, event.id)"><span>{{leftBtn}}</span></button>
          <button class="btn btn-outline-primary btn-ans" @click="postAnswear(ansTwo, event.id)"><span>{{rightBtn}} </span></button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

  export default {
    props: ['boxText','leftBtn','rightBtn'],

    mounted(){
      
    },

    methods: {
      

    }
}

</script>

<style scoped>

  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .floating-div{
    position: fixed;
    width: 60%;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    border-radius: 15px;
    border-style: solid;
    border-color: #007bff;
    background-color: rgba(255, 255, 255, 0.96);  
    transition: all .3s ease;
  }

  .answers-div{
    margin-top: 60px
  }

  .btn-ans{
    margin-top: 10px;
    width: 100%;
    height: 50px;
    vertical-align: middle  
  }

  .event-txt{
    margin-top: 30px;
    font-size: 22px;
  }

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0; 
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
