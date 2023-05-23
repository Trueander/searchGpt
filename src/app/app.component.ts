import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {Configuration, OpenAIApi} from "openai";
import { Observable, finalize } from 'rxjs';

const TEXT_POR_DEFECTO = 'Imagine que trabaja como contador en una empresa. Utilice sus conocimientos de contabilidad para responder al siguiente texto y si no es nada relacionado con la contabilidad responda que SOLO RESPONDE COSAS DE CONTABILIDAD. Texto: ';
declare var webkitSpeechRecognition: any;

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

  cargando: boolean = false;

  textoNuevo: string = '';

  textoFormGroup: FormGroup = new FormGroup({
    textoForm: new FormControl('')
  })

  recognition = new webkitSpeechRecognition();
  isStoppedSpeechRecog = false;
  public text = "";
  tempWords!: any;

  preguntasPreguntas: any[] = [];

  botonVoiceActivo = false;

  hablando: boolean = false;

  constructor() {
  }

  ngOnInit() {
    this.init();
  }

  startService() {
    this.start();
  }

  stopService() {
    this.stop();
  }

  start() {
    this.botonVoiceActivo = true;
    this.text = '';
    this.tempWords = '';
    this.textoNuevo = '';
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    this.recognition.addEventListener('end', (condition: any) => {
      if(this.isStoppedSpeechRecog) {
        this.recognition.stop();
        this.textoNuevo = this.textoNuevo + ' ' + this.text;
      } else {
        this.wordConcat();
        this.recognition.start();
      }
    })
  }

  init() {
    this.recognition.interimResults = true;
    this.recognition.lang = "es-ES";

    this.recognition.addEventListener('result', (e: any) => {
      const transcript = Array.from(e.results)
      .map((result: any) => result[0])
      .map((result: any) => result.transcript)
      .join('');

      this.tempWords = transcript;
    })
  }

  wordConcat() {
    this.text = this.text + '' + this.tempWords + '';
    this.tempWords = '';
  }

  enviarTexto() {
    this.preguntasPreguntas.push({user: 'Tú', texto: this.textoFormGroup.get('textoForm')?.value});
    this.getOpenAIResponse(TEXT_POR_DEFECTO + this.textoFormGroup.get('textoForm')?.value)
    .pipe(finalize(() => {
      this.cargando = false;
    }))
    .subscribe(response => {
      this.preguntasPreguntas.push({user: 'Asistente virtual', texto: response});
      this.cargarVoz(response);
    });
  }

  cargarVoz(texto: string) {

    if (!this.hablando) {
      this.hablando = true;

    const chunkSize = 150;
    const chunks = texto.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];
    const utterances = chunks.map((chunk) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = 'es-Es';
      utterance.onend = () => {
        if (utterances.indexOf(utterance) === utterances.length - 1) {
          this.hablando = false;
        }
      };
      speechSynthesis.speak(utterance);
      return utterance;
    });
  }
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition.stop();

    if(this.text.length > 3) {
      this.preguntasPreguntas.push({user: 'Tú', texto: this.text});
      
    }

    this.cargando = true;
    this.getOpenAIResponse(TEXT_POR_DEFECTO + this.text)
    .pipe(finalize(() => {
      this.cargando = false;
      this.botonVoiceActivo = false;
    }))
    .subscribe(response => {
      if(this.text.length < 3) return
      this.preguntasPreguntas.push({user: 'Asistente virtual', texto: response});
      this.cargarVoz(response);
    });
    
  }

  getOpenAIResponse(texto: string): Observable<string> {
    return new Observable((observer) => {
      let configuration = new Configuration({
        apiKey: "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",
      });
      let openai = new OpenAIApi(configuration);
  
      let requestData = {
        model: "text-davinci-003",
        prompt: texto,
        temperature: 0,
        max_tokens: 400,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };
  
      openai.createCompletion(requestData)
        .then(apiResponse => {
          let respuesta = apiResponse.data.choices[0].text?.trim();
          observer.next(respuesta);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
