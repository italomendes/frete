import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AngularFireModule } from 'angularfire2';
import { DocumentReference } from '@firebase/firestore-types';
import { Http, Response, Headers } from '@angular/http';

interface Cidades{
  nome: String;
  UF: String;
  ref: DocumentReference;
}

interface Bairro{
  nome: String;
  cidade: DocumentReference;
  valorFrete: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  bairro: Bairro = {
    nome: null,
    cidade : null,
    valorFrete: null
  };

  bairroCep = {
    nome: "",
    valorFrete: null
  };
  valbairro: number;
  cidadeSelecionada: DocumentReference;
  ref: DocumentReference;

  val1: String;
  val2: String;

  bairrosCollection: AngularFirestoreCollection<Bairro>;
  cidadesCollection: AngularFirestoreCollection<Cidades>;

  bairros: Observable<Bairro[]>;
  bairrosCep: Observable<Bairro[]>;
  cidadesCad: Observable<Cidades[]>;
  cidadesCon: Observable<Cidades[]>;


  constructor(private afs: AngularFirestore, private _http: Http){
  }
  
  //consulta o barri pelo nome
  consultarBairroNome(nome: String){
    this.bairrosCollection = this.afs.collection('bairros', ref=> {
      return ref.where('nome', '==', nome);
    });
    this.bairrosCep = this.bairrosCollection.valueChanges();
    this.acVal();
  }

  //consulta o endereço pelo cep
  private consultarEndCep(cep: String) {
    const data: any = null;
    return this._http.get('https://viacep.com.br/ws/'+cep+'/json/')
                .map((res: Response) => res.json())
                 .subscribe(data => {
                        data = data;
                        this.bairroCep.nome = data.bairro;
                        this.consultarBairroNome(this.bairroCep.nome);
                });
  }


  //consulta de bairro usando o nome do bairro
  consultarBairro(ref1: DocumentReference){
    this.bairrosCollection = this.afs.collection('bairros', ref=> {
      return ref.where('cidade', '==', ref1);
    });
    this.bairros = this.bairrosCollection.valueChanges();
  }


  //consulta a cidade filtrando pelo estado para exibir no cadastro de bairro
  cidadesCadastro(uf: String){
    this.cidadesCollection = this.afs.collection('cidades', ref=> {
      return ref.where('UF', '==', uf);
    });
    this.cidadesCad = this.cidadesCollection.snapshotChanges().map(actions => {       
      return actions.map(a => {
        const data = a.payload.doc.data() as Cidades;
        data.ref = a.payload.doc.ref;
        return data;
      });
    });
  }

  //consulta a cidade filtrando pelo estado para exibir na consulta
  cidadesConsulta(uf: String){
    this.cidadesCollection = this.afs.collection('cidades', ref=> {
      return ref.where('UF', '==', uf);
    });
    this.cidadesCon = this.cidadesCollection.snapshotChanges().map(actions => {       
      return actions.map(a => {
        const data = a.payload.doc.data() as Cidades;
        data.ref = a.payload.doc.ref;
        return data;
      });
    });
  }


  
  
  //função para salvar o valor do frete e o bairro
  save(bairro: Bairro, ref: DocumentReference){
    const bairrosCollection = this.afs.collection<Bairro>('bairros');
    bairrosCollection.add({ 
      nome: bairro.nome,
      cidade: ref,
      valorFrete: bairro.valorFrete
    }).then((a)=>{
      alert("Salvo com Sucesso!");
      this.bairro.valorFrete = null;
    });
  }
  

  acVal(){
    this.val1 = "Valor do frete no bairro ";
    this.val2 = ": R$";
  }
  val: String;
  pg(){
    this.val = "Valor do frete: R$";
  }
}
