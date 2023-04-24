import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {Configuration, OpenAIApi} from "openai";

const TEXT_POR_DEFECTO = 'Retorname una lista de 5 items enumerada así: 1. "posible descripción" - "https://www.url.com". sobre ';

export class ResponseGpt {
  link!: string;
  description!: string;

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'buscadorGPT';

  respuesta: string | undefined;

  chatGptResponse: ResponseGpt[] = [];

  formulario: FormGroup = new FormGroup({
    textoInput: new FormControl('')
  })

  cargando: boolean = false;

  buscar() {
    this.invokarGpt();
  }

  async invokarGpt() {
    let textoInput = this.formulario.get('textoInput')?.value;

    this.cargando = true;
  
    let textoCombinado = TEXT_POR_DEFECTO + textoInput;
  
    try {
      this.respuesta = undefined;
      let configuration = new Configuration({
        apiKey: "APYKEY",
      });
      let openai = new OpenAIApi(configuration);
  
      let requestData = {
        model: "text-davinci-003",
        prompt: textoCombinado,
        temperature: 0,
        max_tokens: 400,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };

      let apiResponse = await openai.createCompletion(requestData);
      this.respuesta = apiResponse.data.choices[0].text;

      if(!this.respuesta){
        return
      }

      this.chatGptResponse = this.convertirRespuestaToLista(this.respuesta);
      this.cargando = false;
    } catch (error:any) {
      console.error(error);
      this.cargando = false;
    }
  }


  convertirRespuestaToLista(texto: string): ResponseGpt[] {
    const listaRespuesta: ResponseGpt[] = [];
    const regex = /\"(.+?)\"\s-\s\"(.+?)\"/g;
    let coincidencias;
    while ((coincidencias = regex.exec(texto)) !== null) {
      const response = new ResponseGpt();
      response.description = coincidencias[1];
      response.link = coincidencias[2];
      listaRespuesta.push(response);
      if (listaRespuesta.length === 5) {
        break;
      }
    }
    return listaRespuesta;
  }

}
