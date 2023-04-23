import { Component } from '@angular/core';
import {Configuration, OpenAIApi} from "openai";

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

  response: any;
  promptText: string = '';
  defaultText: string = 'Retorname una lista de 5 items enumerada así: 1. "posible descripción" - "www.posibleUrl.com". al buscar un texto ';

  chatGptResponse: ResponseGpt[] = [];

  checkResponse() {
    this.invokeGPT();
  }

  async invokeGPT() {
    if (this.promptText.length < 2) {
      return;
    }
  
    this.promptText = this.defaultText + this.promptText;
  
    try {
      this.response = undefined;
      let configuration = new Configuration({
        apiKey: "APIkey",
      });
      let openai = new OpenAIApi(configuration);
  
      let requestData = {
        model: "text-davinci-003",
        prompt: this.promptText,
        temperature: 0.95,
        max_tokens: 400,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };
      let apiResponse = await openai.createCompletion(requestData);
      
      this.response = apiResponse.data;
      this.chatGptResponse = this.parseResponse(this.response.choices[0].text);
    } catch (error:any) {
      console.error(error);
    }
  }


  parseResponse(text: string): ResponseGpt[] {
    const responseList: ResponseGpt[] = [];
    const regex = /\"(.+?)\"\s-\s\"(.+?)\"/g;
    let matches;
    while ((matches = regex.exec(text)) !== null) {
      const response = new ResponseGpt();
      response.description = matches[1];
      response.link = matches[2];
      responseList.push(response);
      if (responseList.length === 5) {
        break;
      }
    }
    return responseList;
  }

}
