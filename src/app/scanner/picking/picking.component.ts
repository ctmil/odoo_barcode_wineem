import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ToolsService } from '../../service/tools.service';
import { Picking } from '../../picking';
import { ConcatSource } from 'webpack-sources';

declare var jquery: any;
declare var $: any;
declare var navigator: any;
declare var window: any;
declare var cordova: any;

@Component({
  selector: 'app-picking',
  templateUrl: './picking.component.html',
  styleUrls: ['./picking.component.scss']
})
export class PickingComponent implements OnInit, OnChanges {
  // tslint:disable-next-line: no-input-rename
  @Input('server') server = '';
  // tslint:disable-next-line: no-input-rename
  @Input('db') db = '';
  // tslint:disable-next-line: no-input-rename
  @Input('user') user = '';
  // tslint:disable-next-line: no-input-rename
  @Input('pass') pass = '';
  // tslint:disable-next-line: no-input-rename
  @Input('uid') uid = 0;
  ////////////////////////////////////////////
  // tslint:disable-next-line: no-input-rename
  @Input('inLoad') inLoad = true;
  // tslint:disable-next-line: no-input-rename
  @Input('logged') logged = false;
  @Output() log = new EventEmitter();
  @Output() out = new EventEmitter();
  ////////////////////////////
  public barcode = '';
  public barcode_format = '';
  public p_scanned = '';
  public pr_scanned = '';
  public showScann = false;
  public showErr = false;
  ////////////////////////////
  public loading = true;
  public isScanning = false;
  ////////////////////////////
  public pickings: Picking[] = [];
  public pickRep = [];
  public repSel: any;
  public showLeader = false;
  public pickLeader = [];
  public showInternalOps = false;
  public showOPs = false;
  public leaderSel: any;
  public showPicking = false;
  public box: any;
  public boxList = [];
  public boxCreated = false;
  public selP: any;
  public pTable = [];
  public showResumen = false;
  public showClose = false;
  public pBoxes = [];
  public closePicking = false;
  public confirmed = false;
  public isConfirmed = false;
  public trueQty = 0;
  public falseQty = 0;
  public trueProd = '';
  public processItems = [];
  ////////////////////////////
  public alert = '';
  public alertPicking = '';
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

  constructor(public t: ToolsService) { }

  // Lifehooks funs

  public ngOnInit(): void {
    this.getPicking(this.server, this.db, this.user, this.pass, this.uid);
  }

  public ngOnChanges(): void {

  }

  // END - Lifehooks funs

  // Internal use funs

  /* Scann Barcode Function */
  public startScann(i: number): void {
    if (this.pTable[i].scan === false) {
      if (this.pTable[i].ean13 !== false) {
        this.barcode = '';
        this.barcode_format = '';
        this.p_scanned = '';
        this.pr_scanned = '';
        this.showScann = false;
        this.showErr = false;

        setTimeout(() => {
          this.isScanning = true;
        }, 1000);

        cordova.plugins.barcodeScanner.scan(
          (result: any) => {
            this.barcode = result.text;
            this.barcode_format = result.format;
            console.log('Código escaneado correctamente');
            if (this.pTable[i].ean13 === result.text) {
              this.pTable[i].scan_qty = this.pTable[i].scan_qty + 1;
              if (this.pTable[i].scan_qty === this.pTable[i].qty) {
                this.pTable[i].scan = true;
              }
            }
            this.isScanning = false;
          },
          function (error: any) {
            console.log('Scanning failed: ' + error);
            this.isScanning = false;
          },
          this.scanConfig
        );
      } else {
        alert('Este producto no tiene código de Barra cargado');
      }
    } else {
      alert('Producto ya escaneado');
    }
  }

  public getPicking(server_url: string, db: string, user: string, pass: string, uid: number): void {
    $.xmlrpc({
      url: server_url + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [db, uid, pass, 'stock.picking.order', 'search_read', [ [['user', '=', uid], ['state', '=', 'planned']] ],
      {'fields': ['name', 'id', 'partner_id', 'move_ids', 'rep', 'leader'], 'limit': 5}],
      success: (response: any, status: any, jqXHR: any) => {
        if (response) {
          for (let i = 0; i < response[0].length; i++) {
            this.pickings[i] = {
              name: response[0][i].name,
              customer: response[0][i].partner_id,
              id: response[0][i].id,
              rep: response[0][i].rep,
              leader: response[0][i].leader,
              move_ids: response[0][i].move_ids
            };
          }
          const reps = this.t.groupBy(this.pickings, 'rep');
          const values = (<any>Object).values(reps);
          const keys = Object.keys(reps);
          for (let i = 0; i < keys.length; i++) {
            this.pickRep.push({name: keys[i].split(',')[1], vals: values[i], id: i});
          }
            this.loading = false;
        } else {
            this.loading = false;
          this.alert = 'No hay pedidos planeados';
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public readRep(n: number): void {
    this.showLeader = true;
    this.repSel = this.pickRep[n];
    const leaders = this.t.groupBy(this.repSel.vals, 'leader');
    const values = (<any>Object).values(leaders);
    const keys = Object.keys(leaders);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'false') {
        this.pickLeader.push({name: 'Sin Lider', vals: values[i], id: i});
      } else {
        this.pickLeader.push({name: keys[i].split(',')[1], vals: values[i], id: i});
      }
    }
  }

  public readLeader(n: number): void {
    this.showOPs = true;
    this.leaderSel = this.pickLeader[n];
  }

  public readOP(n: number): void {
    this.loading = true;

    const p = this.pickings.filter(obj => {
      return obj.id === n;
    });

    this.selP = p;

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'res.partner', 'search_read', [ [['id', '=', p[0].customer[0]]] ],
      {'fields': ['name', 'id', 'parent_id', 'leader_id']}],
      success: (response: any, status: any, jqXHR: any) => {
        this.loading = false;
        this.showPicking = true;
        console.log('Leader es', response[0][0].leader_id);
        if (response[0][0].leader_id !== false) {
          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
            [ [['state', '=', 'opened'], ['rep_id', '=', response[0][0].leader_id[0]]] ],
            {'fields': ['name', 'id', 'rep_id']}],
            success: (rLeader: any, statusLead: any, jqXHRLead: any) => {
              console.log('Leader: ', rLeader);
              // this.box = rLeader;
              if (rLeader[0].length === 0) {
                this.createBox(p);
              } else {
                this.getBox(rLeader[0][0].id, p);
              }
            },
            error: (jqXHRLead: any, statusLead: any, errorLead: any) => {
              console.log('Error : ' + errorLead );
            }
          });
        } else if (response[0][0].parent_id !== false) {
          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
            [ [['state', '=', 'opened'], ['rep_id', '=', response[0][0].parent_id[0]]] ],
            {'fields': ['name', 'id', 'rep_id']}],
            success: (rRep: any, statusRep: any, jqXHRRep: any) => {
              console.log('Rep: ', rRep);
              // this.box = rRep[0];
              if (rRep[0].length === 0) {
                this.createBox(p);
              } else {
                this.getBox(rRep[0][0].id, p);
              }
            },
            error: (jqXHRLead: any, statusLead: any, errorLead: any) => {
              console.log('Error : ' + errorLead );
            }
          });
        } else {
          this.alertPicking = 'No se puede procesar el pedido. Informar al cliente.';
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public selBox(id: number): void {
    if (this.alertPicking !== '') {
      this.alertPicking = '';
    }

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
      [ [['id', '=', id]] ],
      {'fields': ['name', 'id', 'rep_id']}],
      success: (res: any, status: any, jqXHR: any) => {
        this.box = res[0];
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.picking.order', 'write',
          [ [this.selP[0].id], {'box_id': id}]],
          success: (resP: any, statusP: any, jqXHRP: any) => {
            console.log(resP);
          },
          error: (jqXHRP: any, statusP: any, errorP: any) => {
            console.log('Error : ' + errorP );
          }
        });
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public createBox(picking: any): void {
    if (this.alertPicking !== '') {
      this.alertPicking = '';
    }

    this.boxCreated = true;

    console.log('Crear Caja', picking);
    let picking_rep = 0;
    let picking_rep_rep = false;
    if (picking[0].leader !== false) {
      picking_rep = picking[0].leader[0];
      picking_rep_rep = picking[0].rep[0];
    } else {
      picking_rep = picking[0].rep[0];
    }
    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'create', [{
        name: 'BAPK-' + Math.floor((Math.random() * 5000)),
        state: 'opened',
        rep_id: picking_rep,
        rep_rep_id: picking_rep_rep,
        rep_shipping_id: picking_rep
      }]],
      success: (res: any, status: any, jqXHR: any) => {
        console.log(res);
        this.getBox(res[0], picking);
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error);
      }
    });
  }

  public getBox(id: number, picking: any): void {
    this.pTable = [];
    console.log('Picking: ', picking[0], 'Caja: ', id);

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.picking.order', 'write',
      [ [picking[0].id], {'box_id': id}]],
      success: (res: any, status: any, jqXHR: any) => {
        console.log(res);
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
      [ [['id', '=', id]] ],
      {'fields': ['name', 'id', 'rep_id', 'create_uid']}],
      success: (res: any, status: any, jqXHR: any) => {
        if (res[0][0].create_uid[0] === this.uid) {
          this.box = res[0];
        } else {
          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
            [ [['rep_id', '=', picking[0].rep[0]], ['state', '=', 'opened']] ],
            {'fields': ['name', 'id', 'rep_id', 'create_uid']}],
            success: (resB: any, statusB: any, jqXHRB: any) => {
              if (resB[0].length > 0) {
                const uidBox = [];
                for (const i of resB[0]) {
                  this.alertPicking = 'Ya hay una caja abierta por otro Usuario.';
                  this.boxList.push({name: i.name, id: i.id, u: i.create_uid[1]});
                  if (i.create_uid[0] === this.uid) {
                    uidBox.push(i.id);
                  }
                }

                if (uidBox.length === 1) {
                  console.log('Caja', uidBox[0]);
                  this.selBox(uidBox[0]);
                }
              } else {
                $.xmlrpc({
                  url: this.server + '/object',
                  methodName: 'execute_kw',
                  crossDomain: true,
                  params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
                  [ [['rep_rep_id', '=', picking[0].rep[0]], ['state', '=', 'opened']] ],
                  {'fields': ['name', 'id', 'rep_id', 'create_uid']}],
                  success: (resBB: any, statusBB: any, jqXHRBB: any) => {
                      const uidBox = [];
                      for (const i of resBB[0]) {
                        this.alertPicking = 'Ya hay una caja abierta por otro Usuario.';
                        this.boxList.push({name: i.name, id: i.id, u: i.create_uid[1]});
                        if (i.create_uid[0] === this.uid) {
                          uidBox.push(i.id);
                        }
                      }
                      if (uidBox.length === 1) {
                        console.log('Caja', uidBox[0]);
                        this.selBox(uidBox[0]);
                      }
                  },
                  error: (jqXHRBB: any, statusBB: any, errorBB: any) => {
                    console.log('Error : ' + errorBB );
                  }
                });
              }
            },
            error: (jqXHRB: any, statusB: any, errorB: any) => {
              console.log('Error : ' + errorB );
            }
          });
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });

    for (const move of picking[0].move_ids) {
      let categ = '';
      let default_code = '';
      let qty = 0;
      let ean13 = 0;
      let id = 0;
      let pid = 0;
      let mid = 0;

      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.move', 'search_read',
        [ [['id', '=', move]] ],
        {'fields': ['product_id', 'product_uom_qty', 'picking_id' ]}],
        success: (res: any, status: any, jqXHR: any) => {
          qty = res[0][0].product_uom_qty;
          id = res[0][0].picking_id[0];
          mid = res[0][0].id;

          $.xmlrpc({
            url: this.server + '/object',
            methodName: 'execute_kw',
            crossDomain: true,
            params: [this.db, this.uid, this.pass, 'product.product', 'search_read',
            [ [['id', '=', res[0][0].product_id[0]]] ],
            {'fields': ['id', 'default_code', 'channel_id', 'ean13']}],
            success: (resP: any, statusP: any, jqXHRP: any) => {
              default_code = resP[0][0].default_code;
              ean13 = resP[0][0].ean13;
              pid = resP[0][0].id;

              if (resP[0][0].channel_id) {
                $.xmlrpc({
                  url: this.server + '/object',
                  methodName: 'execute_kw',
                  crossDomain: true,
                  params: [this.db, this.uid, this.pass, 'product.channel', 'search_read',
                  [ [['id', '=', resP[0][0].channel_id[0]]] ],
                  {'fields': ['short_name', 'sequence']}],
                  success: (resC: any, statusC: any, jqXHRC: any) => {
                    categ = resC[0][0].short_name;
                    this.pTable.push({s: resC[0][0].sequence, mid: mid, id: id, pid: pid, categ_id: categ, sku: default_code.replace(/\s/g, ''), qty: qty, ean13: ean13, scan: false, scan_qty: 0});
                    this.pTable.sort((a, b) => (a.s > b.s) ? 1 : -1);
                    this.pTable.sort((a, b) => (a.sku > b.sku) ? 1 : -1);
                  },
                  error: (jqXHRC: any, statusC: any, errorC: any) => {
                    console.log('Error : ' + errorC );
                  }
                });
              } else {
                categ = 'N/A';
                this.pTable.push({s: 0, mid: mid, id: id, pid: pid, categ_id: categ, sku: default_code.replace(/\s/g, ''), qty: qty, ean13: ean13, scan: false, scan_qty: 0});
                this.pTable.sort((a, b) => (a.s > b.s) ? 1 : -1);
                this.pTable.sort((a, b) => (a.sku > b.sku) ? 1 : -1);
              }
            },
            error: (jqXHRP: any, statusP: any, errorP: any) => {
              console.log('Error : ' + errorP );
            }
          });
        },
        error: (jqXHR: any, status: any, error: any) => {
          console.log('Error : ' + error );
        }
      });
    }
    console.log('Tabla:', this.pTable);
  }

  public addQty(i: number) {
    const r = confirm('¿Seguro que desea forzar?');

    if (r) {
      if (this.pTable[i].scan_qty < this.pTable[i].qty) {
        this.pTable[i].scan = true;
        this.pTable[i].scan_qty++;
      }
    }
  }

  public validatePicking() {
    this.isConfirmed = true;
    this.closePicking = true;
    let isScan = false;
    this.confirmed = true;

    let pickings = [];
    let noPickings = [];
    let moves = [];
    let pickingMoves = [];
    let outMoves = [];
    let oldMoves = []

    for (const p of this.pTable) {
      console.log(p);
      if (p.scan && p.qty === p.scan_qty) {
        pickings.push(p.id);
        isScan = true;
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.move', 'write', [ [p.mid], {
            product_uom_qty: p.scan_qty,
            state: 'done'
          }]],
          success: (response: any, statusP: any, jqXHRP: any) => {
            console.log('Stock:', response);
            moves.push(p.mid);
            pickingMoves.push({p: p.id, m: p.mid});
          },
          error: (jqXHRP: any, statusP: any, error: any) => {
            console.log('Error : ' + error );
          }
        });
      } else if (p.scan && p.qty !== p.scan_qty) {
        pickings.push(p.id);
        noPickings.push(p.id);
        isScan = true;
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.move', 'write', [ [p.mid], {
            product_uom_qty: p.scan_qty,
            state: 'done',
            invoice_state: '2binvoiced'
          }]],
          success: (response: any, statusP: any, jqXHRP: any) => {
            console.log('Stock:', response);
            moves.push(p.mid);
            pickingMoves.push({p: p.id, m: p.mid});
          },
          error: (jqXHRP: any, statusP: any, error: any) => {
            console.log('Error : ' + error );
          }
        });
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.move', 'search_read',
          [ [['id', '=', p.mid]] ],
          {'fields': ['partner_id', 'origin']}],
          success: (resM: any, statusM: any, jqXHRM: any) => {
            $.xmlrpc({
              url: this.server + '/object',
              methodName: 'execute_kw',
              crossDomain: true,
              params: [this.db, this.uid, this.pass, 'stock.move', 'create', [{
                product_id: p.pid,
                product_uom_qty: p.qty - p.scan_qty,
                product_uom: 1,
                location_id: 12,
                location_dest_id: 9,
                name: 'STOCK-APP-' + Math.floor((Math.random() * 50000)),
                partner_id: resM[0][0].partner_id[0],
                origin: resM[0][0].origin
              }]],
              success: (response: any, statusP: any, jqXHRP: any) => {
                console.log('New Stock:', response);
                if (outMoves.length > 0) {
                  for (const i of outMoves) {
                    if (i.id === p.id) {
                      i.moves.push(response[0]);
                      break;
                    } else {
                      outMoves.push({id: p.id, moves: [response[0]]});
                      break;
                    }
                  }
                } else {
                  outMoves.push({id: p.id, moves: [response[0]]});
                }
              },
              error: (jqXHRP: any, statusP: any, error: any) => {
                console.log('Error : ' + error );
              }
            });
          },
          error: (jqXHRM: any, statusM: any, errorM: any) => {
            console.log('Error : ' + errorM );
          }
        });
      } else if (p.scan === false) {
        noPickings.push(p.id);
        if (outMoves.length > 0) {
          for (const i of outMoves) {
            if (i.id === p.id) {
              i.moves.push(p.mid);
              break;
            } else {
              outMoves.push({id: p.id, moves: [p.mid]});
              break;
            }
          }
        } else {
          outMoves.push({id: p.id, moves: [p.mid]});
        }
      }
    }

    setTimeout(() => {
      const unique = [...new Set(pickings)];
      console.log('Unique:', unique);
      console.log('Moves', moves);
      const preFilter = this.t.groupBy(pickingMoves, 'p');
      for (const u of unique) {
        const uMoves = [];
        for (const m of preFilter[u]) {
          uMoves.push(m.m);
        }
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.picking', 'write', [ [u], {
            move_lines: [[6, 0, uMoves]],
            state: 'done',
            invoice_state: '2binvoiced'
          }]],
          success: (responseP: any, statusp: any, jqXHRP: any) => {
            console.log('Write Stock Box:', responseP);
            this.processItems.push(u);
          },
          error: (jqXHRP: any, statusP: any, errorP: any) => {
            console.log('Error : ' + errorP );
          }
        });

        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.box', 'write', [ [this.box[0].id], {
            pickings_ids: [ [4, u ]],
          }]],
          success: (responseP: any, statusp: any, jqXHRP: any) => {
            console.log('Write Stock Box:', responseP);
          },
          error: (jqXHRP: any, statusP: any, errorP: any) => {
            console.log('Error : ' + errorP );
          }
        });
      }

      for (const i of outMoves) {
        console.log('Out', i);
        $.xmlrpc({
          url: this.server + '/object',
          methodName: 'execute_kw',
          crossDomain: true,
          params: [this.db, this.uid, this.pass, 'stock.picking', 'search_read',
          [ [['id', '=', i.id]] ],
          {'fields': ['campaign', 'origin', 'partner_id', 'picking_type_id']}],
          success: (resC: any, statusC: any, jqXHRC: any) => {
            $.xmlrpc({
              url: this.server + '/object',
              methodName: 'execute_kw',
              crossDomain: true,
              params: [this.db, this.uid, this.pass, 'stock.picking', 'create', [{
                partner_id: resC[0][0].partner_id[0],
                picking_type_id: resC[0][0].picking_type_id[0],
                backorder_id: i.id,
                origin: resC[0][0].origin,
                campaign: resC[0][0].campaign[0],
                move_lines: [[6, 0, i.moves]]
              }]],
              success: (response: any, status: any, jqXHR: any) => {
                console.log('New Picking:', response);
                for (const m of i.moves) {
                  $.xmlrpc({
                    url: this.server + '/object',
                    methodName: 'execute_kw',
                    crossDomain: true,
                    params: [this.db, this.uid, this.pass, 'stock.move', 'write', [ [m], {
                      picking_id: response[0],
                      state: 'draft'
                    }]],
                    success: (responseM: any, statusM: any, jqXHRM: any) => {
                      console.log('Move Moves');
                    },
                    error: (jqXHRM: any, statusM: any, errorM: any) => {
                      console.log('Error : ' + errorM );
                    }
                  });
                }
              },
              error: (jqXHR: any, status: any, error: any) => {
                console.log('Error : ' + error );
              }
            });
          },
          error: (jqXHRC: any, statusC: any, errorC: any) => {
            console.log('Error : ' + errorC );
          }
        });
      }

      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.picking.order', 'write', [ [this.selP[0].id], {
          state: 'done',
          move_ids: [[6, 0, moves]],
        }]],
        success: (responseP: any, statusp: any, jqXHRP: any) => {
          console.log('Write picking Order:', responseP);
          for (const i of this.pTable) {
            if (i.scan === true) {
              this.trueQty += i.scan_qty;
              if (i.qty !== i.scan_qty) {
                this.falseQty += (i.qty - i.scan_qty);
              }
            } else {
              this.falseQty += (i.qty - i.scan_qty);
            }
          }
          this.showResumen = true;
          this.isConfirmed = false;
        },
        error: (jqXHRP: any, statusP: any, errorP: any) => {
          console.log('Error : ' + errorP );
        }
      });
    }, 1200 * this.pTable.length);
  }

  public listTrueData() {
    this.trueProd = '';
    for (const i of this.pTable) {
      if (i.scan === true) {
        this.trueProd += i.sku + ' - Cantidad: ' + i.scan_qty + '\n';
      }
    }
    $('#dialog').fadeIn(500);
  }

  public listFalseData() {
    this.trueProd = '';
    for (const i of this.pTable) {
      if (i.scan === false) {
        this.trueProd += i.sku + ' - Cantidad: ' + (i.qty - i.scan_qty) + '\n';
      } else {
        if (i.qty !== i.scan_qty) {
          this.trueProd += i.sku + ' - Cantidad: ' + (i.qty - i.scan_qty) + '\n';
        }
      }
    }
    $('#dialog').fadeIn(500);
  }

  public closeList() {
    $('#dialog').fadeOut(300);
  }

  public closeBoxes() {
    this.showLeader = true;
    this.showOPs = true;
    this.showPicking = true;
    this.showResumen = true;
    this.showClose = true;

    $.xmlrpc({
      url: this.server + '/object',
      methodName: 'execute_kw',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
      [ [['create_uid', '=', this.uid], ['state', '=', 'opened']] ],
      {'fields': ['name', 'id', 'rep_id', 'rep_rep_id']}],
      success: (res: any, status: any, jqXHR: any) => {
        console.log('BOXES:', res[0]);
        for (let i = 0; i < res[0].length; i++) {
          this.pBoxes.push({id: res[0][i].id, name: res[0][i].name, lead: res[0][i].rep_rep_id[1] + ' Líder', rep: res[0][i].rep_id[1], state: 'A'});
        }
      },
      error: (jqXHR: any, status: any, error: any) => {
        console.log('Error : ' + error );
      }
    });
  }

  public closeBox(id: number, i: number) {
    const r = confirm('¿Está seguro que desea Cerrar la caja?');

    if (r) {
      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.box', 'write', [ [id], {
          state: 'closed'
        }]],
        success: (response: any, status: any, jqXHR: any) => {
          console.log('Stock Box:', response);
          this.pBoxes[i].state = 'C';
        },
        error: (jqXHR: any, status: any, error: any) => {
          console.log('Error : ' + error );
          alert('La Caja no se puede Cerrar');
        }
      });
    }
  }

  public printRC(id: number, i: number) {
    $.xmlrpc({
      url: this.server + '/report',
      methodName: 'render_report',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'uniqs_box_detailed_2.print', [id]],
      success: (res: any, statusR: any, jqXHRR: any) => {
        this.savebase64AsPDF(cordova.file.externalRootDirectory, this.pBoxes[i].name + '-RC-.pdf', res[0].result, 'application/pdf');
      },
      error: (jqXHRR: any, statusR: any, errorR: any) => {
        console.log('Error : ' + errorR );
      }
    });
  }

  public printEC(id: number, i: number) {
    console.log(this.pBoxes[i].name);
    $.xmlrpc({
      url: this.server + '/report',
      methodName: 'render_report',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'uniqs_box_label_2.print', [id]],
      success: (res: any, statusR: any, jqXHRR: any) => {
        this.savebase64AsPDF(cordova.file.externalRootDirectory, this.pBoxes[i].name + '-EC-.pdf', res[0].result, 'application/pdf');
      },
      error: (jqXHRR: any, statusR: any, errorR: any) => {
        console.log('Error : ' + errorR );
      }
    });
  }

  public getReportTag(id: number) {
    $.xmlrpc({
      url: this.server + '/report',
      methodName: 'render_report',
      crossDomain: true,
      params: [this.db, this.uid, this.pass, 'picking_packing_list_print', this.processItems],
      success: (res: any, statusR: any, jqXHRR: any) => {
        this.savebase64AsPDF(cordova.file.externalRootDirectory, this.selP[0].name + '.pdf', res[0].result, 'application/pdf');
      },
      error: (jqXHRR: any, statusR: any, errorR: any) => {
        console.log('Error : ' + errorR );
      }
    });
  }

  b64toBlob(b64Data, contentType, sliceSize?): any {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  savebase64AsPDF(folderpath, filename, content, contentType): any {
    const DataBlob = this.b64toBlob(content, contentType);

    console.log('Starting to write the file');

    window.resolveLocalFileSystemURL(folderpath, function(dir) {
      console.log('Access to the directory granted succesfully');
      dir.getFile(filename, {create: true}, function(file) {
            console.log('File created succesfully.');
            file.createWriter(function(fileWriter) {
                console.log('Writing content to file');
                fileWriter.write(DataBlob);
                console.log('Folder Path' + folderpath + filename);
                const finalPath = folderpath + filename;
                cordova.plugins.fileOpener2.open(
                  finalPath,
                  'application/pdf',
                  {
                      error : function(e) {
                          console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
                      },
                      success : function () {
                          console.log('file opened successfully');
                      }
                  }
                );

            }, function() {
                alert('No se puede guardar el archivo en ' + folderpath);
            });
      });
    });
  }

  reset(): void {
    for (const p of this.pTable) {
      if (p.scan) {
        p.scan = false;
        p.scan_qty = 0;
      }
    }
  }

  backReps(): void {
    if (this.confirmed === false) {
      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
        [ [['id', '=', this.box[0].id]] ],
        {'fields': ['pickings_ids']}],
        success: (res: any, status: any, jqXHR: any) => {
          if (res[0][0].pickings_ids === []) {
            $.xmlrpc({
              url: this.server + '/object',
              methodName: 'execute_kw',
              crossDomain: true,
              params: [this.db, this.uid, this.pass, 'stock.box', 'write', [ [this.box[0].id], {
                state: 'closed'
              }]],
              success: (responseB: any, statusB: any, jqXHRB: any) => {
                console.log('Stock Box:', responseB);
              },
              error: (jqXHRB: any, statusB: any, errorB: any) => {
                console.log('Error : ' + errorB );
                alert('La Caja no se puede Cerrar');
              }
            });

            $.xmlrpc({
              url: this.server + '/object',
              methodName: 'execute_kw',
              crossDomain: true,
              params: [this.db, this.uid, this.pass, 'stock.order.picking', 'write', [ [this.selP[0].id], {
                state: 'closed'
              }]],
              success: (responseB: any, statusB: any, jqXHRB: any) => {
                console.log('Stock Picking:', responseB);
              },
              error: (jqXHRB: any, statusB: any, error: any) => {
                console.log('Error : ' + error );
              }
            });
          }
        },
        error: (jqXHR: any, status: any, error: any) => {
          console.log('Error : ' + error );
        }
      });
    }

    this.showPicking = false;
    this.box = false;
    this.boxList = [];
    this.boxCreated = false;
    this.selP = false;
    this.pTable = [];
    this.showResumen = false;
    this.showClose = false;
    this.pBoxes = [];
    this.closePicking = false;
    this.confirmed = false;
    this.isConfirmed = false;
    this.trueQty = 0;
    this.falseQty = 0;
    this.trueProd = '';
    this.alert = '';
    this.alertPicking = '';
  }

  // END - Internal use funs

  public goOut(): void {
    if (this.boxCreated === true && this.confirmed === false) {
      $.xmlrpc({
        url: this.server + '/object',
        methodName: 'execute_kw',
        crossDomain: true,
        params: [this.db, this.uid, this.pass, 'stock.box', 'search_read',
        [ [['id', '=', this.box[0].id]] ],
        {'fields': ['pickings_ids']}],
        success: (res: any, status: any, jqXHR: any) => {
          if (res[0][0].pickings_ids === []) {
            $.xmlrpc({
              url: this.server + '/object',
              methodName: 'execute_kw',
              crossDomain: true,
              params: [this.db, this.uid, this.pass, 'stock.box', 'write', [ [this.box[0].id], {
                state: 'closed'
              }]],
              success: (responseB: any, statusB: any, jqXHRB: any) => {
                console.log('Stock Box:', responseB);
              },
              error: (jqXHRB: any, statusB: any, errorB: any) => {
                console.log('Error : ' + errorB );
                alert('La Caja no se puede Cerrar');
              }
            });

            $.xmlrpc({
              url: this.server + '/object',
              methodName: 'execute_kw',
              crossDomain: true,
              params: [this.db, this.uid, this.pass, 'stock.order.picking', 'write', [ [this.selP[0].id], {
                state: 'closed'
              }]],
              success: (responseB: any, statusB: any, jqXHRB: any) => {
                console.log('Stock Picking:', responseB);
              },
              error: (jqXHRB: any, statusB: any, error: any) => {
                console.log('Error : ' + error );
              }
            });
          }
        },
        error: (jqXHR: any, status: any, error: any) => {
          console.log('Error : ' + error );
        }
      });
    }

    this.out.emit();
  }

}
