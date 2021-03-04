import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-addstock',
  templateUrl: './addstock.component.html',
  styleUrls: ['./addstock.component.scss']
})
export class AddstockComponent implements OnInit {

  @Input() server = '';
  @Input() db = '';
  @Input() user = '';
  @Input() pass = '';
  @Input() uid = 0;

  product: any = {};
  stock = 0;
  barcode = '';
  showProduct = false;
  showStatus = false;
  msg = 'agregaron';

  ////////////////////////////
  @ViewChild('barcodeScanner', {static: false}) barcodeScanner: ElementRef;
  isScanner = false;

  constructor() { }

  ngOnInit() {
    this.startScann();
  }

  /* Scann Barcode Function */
  public startScann(): void {

    this.showProduct = false;
    this.barcode = '';

    setTimeout(() => {
      this.barcodeScanner.nativeElement.focus();
    }, 0);
  }

  public search(e: any) {
    const ean13 = this.barcode;
    console.log(this.barcode);

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'product.product', 'search_read', [ [['ean13', '=', ean13]] ],
      {'fields': ['name', 'qty_available']}],
      success: (response: any, status: any, jqXHR: any) => {
        console.log(response[0][0]);
        if (response[0][0]) {
          this.product = response[0][0];
          this.showProduct = true;
        } else {
          alert('No se ha encontrado el producto.');
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public loadStock() {
    console.log(this.stock);
    console.log(this.product.id);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const ss = String(today.getSeconds());
    const ii = String(today.getMinutes());
    const hh = String(today.getUTCHours());

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.quant', 'create', [{
        product_id: this.product.id,
        qty: this.stock,
        location_id: 12,
        in_date: yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + ii + ':' + ss
      }]],
      success: (responseP: any, statusp: any, jqXHRP: any) => {
        console.log('Stock Agregado');
        this.showProduct = false;
        this.msg = 'agregaron';
        this.showStatus = true;
        setTimeout(() => {
          this.stock = 0;
          this.product = {};
          this.showStatus = false;
        }, 5000);

        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.move', 'create', [{
            product_id: this.product.id,
            product_uos_qty: this.stock,
            product_uom_qty: this.stock,
            product_uom: 1,
            location_id: 22,
            location_dest_id: 12,
            state: 'done',
            name: 'STOCK-APP-' + Math.floor((Math.random() * 50000)),
            quant_ids: [[6, 0, responseP]]
          }]],
          success: (responseM: any, statusP: any, jqXHRMM: any) => {
            console.log('New Stock:', responseM);
          },
          error: (jqXHRMM: any, statusMM: any, errorM: any) => {
            console.log('Error : ' + errorM );
          }
        });
      },
      error: (jqXHRM: any, statusM: any, errorM: any) => {
        console.log('Error : ' + errorM );
      }
    });
  }

  lessStock() {
    console.log(this.stock);
    console.log(this.product.id);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const ss = String(today.getSeconds());
    const ii = String(today.getMinutes());
    const hh = String(today.getUTCHours());

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.quant', 'create', [{
        product_id: this.product.id,
        qty: this.stock * -1,
        location_id: 12,
        in_date: yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + ii + ':' + ss
      }]],
      success: (responseP: any, statusp: any, jqXHRP: any) => {
        console.log('Stock Restado');
        this.showProduct = false;
        this.msg = 'restaron';
        this.showStatus = true;
        setTimeout(() => {
          this.stock = 0;
          this.product = {};
          this.showStatus = false;
        }, 5000);

        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.move', 'create', [{
            product_id: this.product.id,
            product_uos_qty: this.stock,
            product_uom_qty: this.stock,
            product_uom: 1,
            location_id: 12,
            location_dest_id: 22,
            state: 'done',
            name: 'STOCK-APP-' + Math.floor((Math.random() * 50000)),
            quant_ids: [[6, 0, responseP]]
          }]],
          success: (responseM: any, statusP: any, jqXHRMM: any) => {
            console.log('New Stock:', responseM);
          },
          error: (jqXHRMM: any, statusMM: any, errorM: any) => {
            console.log('Error : ' + errorM );
          }
        });
      },
      error: (jqXHRM: any, statusM: any, errorM: any) => {
        console.log('Error : ' + errorM );
      }
    });
  }

}
