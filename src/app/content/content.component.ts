import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

    public data;
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "email";
    public sortOrder = "asc";

    constructor() {
    }

    ngOnInit(): void {
    /*    this.http.get("app/demo/data.json")
            .subscribe((data)=> {
                setTimeout(()=> {
                    this.data = data.json();
                }, 1000);
            });*/
		 this.data = [
		  {
		    "name": "Wing",
		    "email": "tellus.eu.augue@arcu.com",
		    "regDate": "2016-01-09T14:48:34-08:00",
		    "city": "Paglieta",
		    "age": 25
		  },
		  {
		    "name": "Whitney",
		    "email": "sed.dictum@Donec.org",
		    "regDate": "2017-01-23T20:09:52-08:00",
		    "city": "Bear",
		    "age": 32
		  },
		  {
		    "name": "Oliver",
		    "email": "mauris@Craslorem.ca",
		    "regDate": "2015-11-19T19:11:33-08:00",
		    "city": "Bruderheim",
		    "age": 31
		  },
		  {
		    "name": "Vladimir",
		    "email": "mi.Aliquam@Phasellus.net",
		    "regDate": "2015-11-02T07:59:34-08:00",
		    "city": "Andenne",
		    "age": 50
		  },
		  {
		    "name": "Maggy",
		    "email": "ligula@acorciUt.edu",
		    "regDate": "2017-02-25T15:42:17-08:00",
		    "city": "HomprŽ",
		    "age": 24
		  },{
		    "name": "Iona",
		    "email": "rutrum.justo@eu.org",
		    "regDate": "2015-11-10T14:36:30-08:00",
		    "city": "Legal",
		    "age": 48
		  },
		  {
		    "name": "Eve",
		    "email": "risus.Morbi@aliquameros.com",
		    "regDate": "2015-12-21T09:25:33-08:00",
		    "city": "Illapel",
		    "age": 42
		  },
		  {
		    "name": "Jayme",
		    "email": "a.nunc.In@convallisante.ca",
		    "regDate": "2016-02-07T10:22:09-08:00",
		    "city": "Ville de Maniwaki",
		    "age": 30
		  },
		  {
		    "name": "Bo",
		    "email": "posuere.cubilia.Curae@estNunclaoreet.net",
		    "regDate": "2016-08-16T20:42:44-07:00",
		    "city": "Pak Pattan",
		    "age": 24
		  },
		  {
		    "name": "Matthew",
		    "email": "enim.Mauris.quis@vehicula.edu",
		    "regDate": "2015-05-01T01:53:59-07:00",
		    "city": "Alacant",
		    "age": 35
		  },
		  {
		    "name": "Justina",
		    "email": "Donec.nibh@Vivamusmolestie.ca",
		    "regDate": "2015-06-24T14:38:07-07:00",
		    "city": "Kobbegem",
		    "age": 22
		  }];
    }

    public toInt(num: string) {
        return +num;
    }

    public sortByWordLength = (a: any) => {
        return a.city.length;
    }
}