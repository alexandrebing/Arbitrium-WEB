<template>
    <div class="container"><a href="/resultado">Voltar para os resultados</a>
        <h1>Entendendo o cálculo dos resultados</h1>
        <p class="destaque">atividades que pontuam por dia: uma mesma atividade em dias diferentes se repete na lista abaixo</p>
        <table>
            <tr>
                <th>atividade</th><th>horas em um mesmo dia</th><th>pontos familia</th><th>pontos trabalho</th><th>pontos dinheiro</th><th>pontos saude</th>
            </tr>
            <tr v-for="ln in linhas.length" :key="ln + 'dia'">
                <th>{{linhas[ln-1].atividade}}</th>
                <th>{{linhas[ln-1].incidencias}}</th>
                <th>{{linhas[ln-1].ptosFamilia}}</th>
                <th>{{linhas[ln-1].ptosTrabalho}}</th>
                <th>{{linhas[ln-1].ptosDinheiro}}</th>
                <th>{{linhas[ln-1].ptosSaude}}</th>
            </tr>
        </table>
        <p class="destaque">atividades que pontuam por hora por hora ou semana: as atividades não se repetem e é computado o valor total</p>
        <table>
            <tr>
                <th>atividade</th><th>total de horas em todas as semanas</th><th>pontos familia</th><th>pontos trabalho</th><th>pontos dinheiro</th><th>pontos saude</th>
            </tr>
            <tr v-for="ln in linhasSemana.length" :key="ln  + 'semana'">
                <th>{{linhasSemana[ln-1].atividade}}</th>
                <th>{{linhasSemana[ln-1].incidencias}}</th>
                <th>{{linhasSemana[ln-1].ptosFamilia}}</th>
                <th>{{linhasSemana[ln-1].ptosTrabalho}}</th>
                <th>{{linhasSemana[ln-1].ptosDinheiro}}</th>
                <th>{{linhasSemana[ln-1].ptosSaude}}</th>
            </tr>
        </table>
        <p class="destaque">resultado final</p>
        <table>
            <tr>
                <th class="destaque">Total (sem eventos)</th>
                <th>Familia: {{totalFamilia}}</th>
                <th>Trabalho: {{totalTrabalho}}</th>
                <th>Dinheiro: {{totalDinheiro}}</th>
                <th>Saude: {{totalSaude}}</th>

            </tr>
        </table>
    </div>
</template>

<script>
import {getCalc as getCalc} from "../services/results";
export default {

    data(){
        return{
            interviewId: '',
            linhas: [],
            linhasSemana: [],
            totalFamilia: 0,
            totalTrabalho: 0,
            totalDinheiro: 150,
            totalSaude: 150
        }
    },

    mounted(){
        this.getSessionId();
        this.getSessionCalc();
    },

    methods:{
        getSessionId(){
            this.interviewId = sessionStorage.getItem("interview") || 0;
        },
        getSessionCalc(){
            getCalc(this.interviewId)
            .then( res => {
                console.log(res)
                let len = res.data.length;
                for(let i=0; i<len; i++){
                    let linha = {
                        atividade: res.data[i].activityId,
                        dia: i + 1,
                        incidencias:  res.data[i].occurrences,
                        ptosFamilia: res.data[i].familyPoints,
                        ptosTrabalho: res.data[i].workPoints,
                        ptosDinheiro: res.data[i].moneyPoints,
                        ptosSaude: res.data[i].healthPoints
                    }

                    this.totalFamilia += res.data[i].familyPoints;
                    this.totalTrabalho += res.data[i].workPoints;
                    this.totalDinheiro += res.data[i].moneyPoints;
                    this.totalSaude += res.data[i].healthPoints;

                    if (res.data[i].activityTipe == 'D'){
                        this.linhas.push(linha)
                    } else{
                        this.linhasSemana.push(linha)
                    }
                    
                }

                console.log(this.linhas)


            })
            .catch(err =>{
                console.log(err)
            })
        }
    }
    
}
</script>


<style scoped>

.destaque{
    font-weight: bold;
}

table {
  width: 100%;
  text-align: center
}

th,td {
  border: 1px solid black;
}

th {
  height: 50px;
  font-weight: normal;
}

</style>
