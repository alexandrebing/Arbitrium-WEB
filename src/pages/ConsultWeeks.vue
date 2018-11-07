<template>
  <div class="container" v-if="access">

  	<div class="header">
    	<div class="col-md-2"></div>
    	<div class="col-md-8">
    		<h1>Área do pesquisador</h1>
      	<p>Pesquisar semana de um participante</p>
      	<input class="fixed-width" type="number" placeholder="id do participante" size="50" min="1" v-model.lazy="interviewId"/>
      	<input class="fixed-width" type="number" placeholder="número da semana" size="50" min="1" max="4" v-model.lazy="weekNumber">
      	<button @click="getWeek()">Pesquisar</button>
    	</div>
    	<div class="col-md-2">
      	<router-link to="/">
      		<p class="clickable">Início</p>
      	</router-link>
      	<p class="clickable" @click="showReport">Gerar relatório geral</p>
      	<p class="clickable" @click="closeWeek">Limpar consulta</p>
    	</div>
  	</div>

    <div class="table" v-if="showResults">
    	<table class="centralized">
      	<tr>
        	<th>Hora</th><th>Segunda-feira</th><th>Terça-feira</th> <th>Quarta-feira</th><th>Quinta-feira</th> <th>Sexta-feira</th> <th>Sábado</th> <th>Domingo</th> 
      	</tr>
      	<tr v-for="hour in hours" :key="hour">
        	<th>{{hour-1}}h</th><th v-for="day in days" :key="day">{{activities[day-1][hour-1].description}}</th>
      	</tr>
    	</table>
  	</div>
		
	</div>
</template>

<script>
import { findOne as findWeek } from "../services/week";

export default {
  data() {
    return {
      interviewId: String,
      weekNumber: String,
      hours: 24,
      days: 7,
      showResults: false,
      activities: Object,
      dayList: Array(7),
      hourList: Array(24),
      access: false
    };
  },

  mounted() {
    if (!this.access) {
      if (prompt("Insira a sua senha") == "arbitrium") {
        this.access = true;
      } else {
        alert("Você não tem permissão. Voltando para a página inicial.");
        this.$router.push("/");
      }
    }
  },

  methods: {

    getWeek() {
      let consultData = {
        interviewId: this.interviewId,
        weekNumber: this.weekNumber
      };
      let data = JSON.stringify(consultData);
      findWeek(data)
        .then(res => {
          this.activities = res.data;
          this.showResults = true;
        })
        .catch(error => {
          console.error("Erro ao pesquisar a semana do usuário", error);
          this.alertError();
        });
    },

    alertError() {
      alert("Erro ao buscar a semana");
    },

    closeWeek() {
      this.showResults = false;
      this.interviewId = "";
      this.weekNumber = "";
      this.activities = [];
    },

    showReport() {
      this.$router.push("relatorio");
		}
		
  }
};
</script>

<style scoped>

.fixed-width {
  width: 200px;
}

.table {
  margin-top: 20px;
  max-height: 500px;
  overflow: auto;
}

.clickable {
  cursor: pointer;
  color: #007bff;
  text-align: left;
}

.clickable:hover {
  text-decoration: underline;
}

table {
  width: 100%;
}

th,td {
  border: 1px solid black;
}

th {
  height: 50px;
  font-weight: normal;
}

</style>
