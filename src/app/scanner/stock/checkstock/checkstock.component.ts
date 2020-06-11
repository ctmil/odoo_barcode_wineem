import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-checkstock',
  templateUrl: './checkstock.component.html',
  styleUrls: ['./checkstock.component.scss']
})
export class CheckstockComponent implements OnInit {
  @Input() server = '';
  @Input() db = '';
  @Input() user = '';
  @Input() pass = '';
  @Input() uid = 0;

  product: any;
  barcode = '';
  showProduct = false;

  ////////////////////////////
  public scanConfig = {
    preferFrontCamera : false,    // iOS and Android
    showFlipCameraButton : false, // iOS and Android
    showTorchButton : true,       // iOS and Android
    torchOn: false,               // Android, launch with the torch switched on (if available)
    prompt : 'Place a barcode inside the scan area', // Android
    resultDisplayDuration: 0,     // Time of show
    orientation : 'portrait',     // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations : true,     // iOS
    disableSuccessBeep: false     // iOS and Android
  };

  constructor() { }

  ngOnInit() {
    this.startScann();
  }

  /* Scann Barcode Function */
  public startScann(): void {
    this.showProduct = false;
    this.barcode = '';
    cordova.plugins.barcodeScanner.scan(
      (result: any) => {
        console.log('Código escaneado correctamente');
        this.barcode = result.text;
      },
      function (error: any) {
        console.log('Scanning failed: ' + error);
        alert('El escaneo falló, intente nuevamente');
      },
      this.scanConfig
    );
  }

  public search() {
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
