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

  product: any;
  barcode = '';
  showProduct = false;

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
      params: [this.db, this.uid, this.pass, 'product.template', 'search_read', [ [['ean13', '=', ean13]] ],
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

}
