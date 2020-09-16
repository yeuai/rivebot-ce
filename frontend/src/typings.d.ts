/* SystemJS module definition */
declare var nodeModule: NodeModule;
interface NodeModule {
  id: string;
}
type t = Window & typeof globalThis;
declare var window : t;
interface Window {
  process: any;
  require: any;
  Handlebars: any;
  _hbs_helpers: any;
  _appsettings: any;
  _appversion: any;
}

declare var $: any;
