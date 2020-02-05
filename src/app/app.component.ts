import { Component, ViewChild, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { timer } from 'rxjs';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('logged', [
      state('inactive', style({
        left: '50%'
      })),
      state('active',   style({
        left: '-100%'
      })),
      transition('inactive => active', [
        animate(500, keyframes([
          style({position: 'static', left: '0', offset: 0}),
          style({position: 'absolute', left: '50%', offset: 0.01}),
          style({position: 'absolute', left: '55%', offset: 0.2}),
          style({position: 'absolute', left: '55%', offset: 0.4}),
          style({position: 'absolute', left: '-100%', offset: 0.99}),
          style({position: 'static', left: '0', offset: 1.0}),
        ]))
      ]),
      transition('active => inactive', animate('500ms ease-in-out'))
    ])
  ]
})

export class AppComponent implements OnInit {
  public title = 'wineem';
  ////////////////////////////
  @ViewChild('form', {static: false}) form: ElementRef;
  public server = 'http://192.168.0.12/xmlrpc/2';
  public db = 'odoo_prod';
  public user = '';
  public pass = '';
  public uid = 0;
  ////////////////////////////
  public odoo_url_value = '';
  public odoo_db_value = '';
  public odoo_user_value = '';
  public odoo_pass_value = '';
  ////////////////////////////
  public logState = 'inactive';
  ////////////////////////////
  public showData = false;
  public logged = false;
  public inLoad = true;

  constructor(private renderer: Renderer2) {}

  public ngOnInit(): void {
    this.renderer.listen('document', 'deviceready', () => {
      console.log('Device is Ready');
    });

    this.logData();
  }

  public logData(): void {
    this.odoo_user_value = window.localStorage.getItem('user');
    this.odoo_pass_value = window.localStorage.getItem('pass');
  }

  public logIn(e: any): void {
    e.preventDefault();
    console.log('Data Readed');
    console.log('User: ', this.form.nativeElement.elements['user'].value);
    console.log('Pass: ', this.form.nativeElement.elements['pass'].value);

    this.user = this.form.nativeElement.elements['user'].value;
    this.pass = this.form.nativeElement.elements['pass'].value;

    window.localStorage.setItem('user', this.form.nativeElement.elements['user'].value);
    window.localStorage.setItem('pass', this.form.nativeElement.elements['pass'].value);

    ////////////////////////////////////////////////////////////////////////

    this.logState = 'active';

    const secondsCounter = timer(300);

    secondsCounter.subscribe( () => {
      this.showData = true;
      this.odooConnect(this.server, this.db, this.user, this.pass);
    });
  }

  public odooConnect(server: string, db: string, user: string, pass: string): void {
    this.logged = false;
    const forcedUserValue = $.xmlrpc.force('string', user);
    const forcedPasswordValue = $.xmlrpc.force('string', pass);
    const forcedDbNameValue = $.xmlrpc.force('string', db);

    $.xmlrpc({
      url: this.server + '/common',
      methodName: 'login',
      dataType: 'xmlrpc',
      crossDomain: true,
      params: [forcedDbNameValue, forcedUserValue, forcedPasswordValue],
      success: (response: any, status: any, jqXHR: any) => {
        console.log(response + ' - ' + status);
        if (response[0] !== false) {
          this.logged = true;
          this.inLoad = false;
          this.uid = response[0];
        } else {
          this.logOut();
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Err: ' + jqXHR + ' - ' + status + '-' + error);
        this.logOut();
      }
    });
  }

  public logOut(): void {
    this.showData = false;
    this.inLoad = true;
    this.logged = false;
    this.logState = 'inactive';
  }
}
