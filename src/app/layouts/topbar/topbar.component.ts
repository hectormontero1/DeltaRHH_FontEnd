import { LoadingService } from './../../core/services/loading.service';
import { Component, OnInit, EventEmitter, Output, Inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { EventService } from "../../core/services/event.service";

//Logout
import { environment } from "../../../environments/environment";
import { AuthenticationService } from "../../core/services/auth.service";
import { AuthfakeauthenticationService } from "../../core/services/authfake.service";
import { TokenStorageService } from "../../core/services/token-storage.service";
import { Router } from "@angular/router";

// Language
import { CookieService } from "ngx-cookie-service";
import { LanguageService } from "../../core/services/language.service";
import { TranslateService } from "@ngx-translate/core";

import { CartModel } from "./topbar.model";
import { cartData } from "./data";
import { User } from "src/app/core/models/auth.models";
import { GlobalComponent } from "src/app/global-component";
import { Subscription } from "rxjs";
import { CacheService } from "src/app/core/services/cache.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  element: any;
  mode: string | undefined;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  cartData!: CartModel[];
  total = 0;
  cart_length: any = 0;
  selectedPeople: any;
  Default: any;
  flagvalue: any;
  valueset: any;
  empresas: any;
  countryName: any;
  cookieValue: any;
  userData: any;
  user!: User;
  private cacheSubscription!: Subscription;
  constructor(
    @Inject(DOCUMENT) private document: any,
    private cacheService: CacheService,
    private eventService: EventService,
    public languageService: LanguageService,
    public _cookiesService: CookieService,
    public translate: TranslateService,
    private authService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService,
    private loading: LoadingService,
    private router: Router,
    private TokenStorageService: TokenStorageService
  ) {
    this.cacheSubscription = this.cacheService.cache$.subscribe((data) => {
      if(data!=null){
      if(data.clase=="empresas" ){
        this.empresas = data.data;
      }
    }
    });

    this.getData("empresas");
  }

  onChange(event: any) {
    this.loading.showSpinner2("Cargando")
    this.user = JSON.parse(localStorage.getItem(GlobalComponent.CURRENT_USER)!);
    this.user.IdCompania = event.ID_EMPRESA;
    localStorage.setItem(
      GlobalComponent.CURRENT_USER,
      JSON.stringify(this.user)
    );
    this.eventService
      .Consultarempleados(
        this.user.Nombre!,
        this.user.password!,
        this.user.IdCompania!
      )
      .subscribe((data) => {
        try {
          this.cacheService.clear("empleados");
          this.cacheService.set("empleados","empleados",new Date(), data);
          this.loading.closeSpinner()
          // this.eventService.sendData(data.Result);
        } catch (error) {
          console.error(error);
          // maneja el error como prefieras aquí
        }
      });
  }

  getData(page: string): void {
    const cachedData = this.cacheService.get(page);
    this.user = JSON.parse(localStorage.getItem(GlobalComponent.CURRENT_USER)!);
    // Si los datos no están en caché, los recuperamos del servidor y los almacenamos en la caché.
    if (!cachedData) {
      this.eventService
        .Consultarempresa(this.user.Nombre!, this.user.password!)
        .subscribe((data) => {
          try {
            this.empresas = data;
            this.selectedPeople = this.empresas[0].ID_EMPRESA;
            this.user.IdCompania = this.empresas[0].ID_EMPRESA;
            localStorage.setItem(
              GlobalComponent.CURRENT_USER,
              JSON.stringify(this.user)
            );
            this.user = JSON.parse(
              localStorage.getItem(GlobalComponent.CURRENT_USER)!
            );
            this.cacheService.clear(page);
            this.cacheService.set(page,page,new Date(), data);
          } catch (error) {
            console.error(error);
            // maneja el error como prefieras aquí
          }
        });
    } 
  }
  ngOnInit(): void {
    this.userData = this.TokenStorageService.getUser();
    this.element = document.documentElement;

    // Cookies wise Language set
    this.cookieValue = this._cookiesService.get("lang");
    const val = this.listLang.filter((x) => x.lang === this.cookieValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.valueset = "assets/images/flags/us.svg";
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }

    //  Fetch Data
    this.cartData = cartData;
    this.cart_length = this.cartData.length;
    this.cartData.forEach((item) => {
      var item_price = item.quantity * item.price;
      this.total += item_price;
    });
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  /**
   * Fullscreen method
   */
  fullscreen() {
    document.body.classList.toggle("fullscreen-enable");
    if (
      !document.fullscreenElement &&
      !this.element.mozFullScreenElement &&
      !this.element.webkitFullscreenElement
    ) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  /**
   * Topbar Light-Dark Mode Change
   */
  changeMode(mode: string) {
    this.mode = mode;
    this.eventService.broadcast("changeMode", mode);

    switch (mode) {
      case "light":
        document.body.setAttribute("data-layout-mode", "light");
        document.body.setAttribute("data-sidebar", "light");
        break;
      case "dark":
        document.body.setAttribute("data-layout-mode", "dark");
        document.body.setAttribute("data-sidebar", "dark");
        break;
      default:
        document.body.setAttribute("data-layout-mode", "light");
        break;
    }
  }

  /***
   * Language Listing
   */
  listLang = [
    { text: "English", flag: "assets/images/flags/us.svg", lang: "en" },
    { text: "Española", flag: "assets/images/flags/spain.svg", lang: "es" },
    { text: "Deutsche", flag: "assets/images/flags/germany.svg", lang: "de" },
    { text: "Italiana", flag: "assets/images/flags/italy.svg", lang: "it" },
    { text: "русский", flag: "assets/images/flags/russia.svg", lang: "ru" },
    { text: "中国人", flag: "assets/images/flags/china.svg", lang: "ch" },
    { text: "français", flag: "assets/images/flags/french.svg", lang: "fr" },
    { text: "Arabic", flag: "assets/images/flags/ae.svg", lang: "ar" },
  ];

  /***
   * Language Value Set
   */
  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
  }

  oncheckboxchange(evnt: any) {}

  /**
   * Logout the user
   */
  logout() {
    this.authService.logout();
    // if (environment.defaultauth === 'firebase') {
    //   this.authService.logout();
    // } else {
    //   this.authFackservice.logout();
    // }
    this.router.navigate(["/auth/login"]);
  }

  windowScroll() {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      (document.getElementById("back-to-top") as HTMLElement).style.display =
        "block";
    } else {
      (document.getElementById("back-to-top") as HTMLElement).style.display =
        "none";
    }
  }

  // Delete Item
  deleteItem(event: any, id: any) {
    var price = event.target
      .closest(".dropdown-item")
      .querySelector(".item_price").innerHTML;
    var Total_price = this.total - price;
    this.total = Total_price;
    this.cart_length = this.cart_length - 1;
    this.total > 1
      ? ((document.getElementById("empty-cart") as HTMLElement).style.display =
          "none")
      : ((document.getElementById("empty-cart") as HTMLElement).style.display =
          "block");
    document.getElementById("item_" + id)?.remove();
  }

  // Search Topbar
  Search() {
    var searchOptions = document.getElementById(
      "search-close-options"
    ) as HTMLAreaElement;
    var dropdown = document.getElementById(
      "search-dropdown"
    ) as HTMLAreaElement;
    var input: any,
      filter: any,
      ul: any,
      li: any,
      a: any | undefined,
      i: any,
      txtValue: any;
    input = document.getElementById("search-options") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    var inputLength = filter.length;

    if (inputLength > 0) {
      dropdown.classList.add("show");
      searchOptions.classList.remove("d-none");
      var inputVal = input.value.toUpperCase();
      var notifyItem = document.getElementsByClassName("notify-item");

      Array.from(notifyItem).forEach(function (element: any) {
        var notifiTxt = "";
        if (element.querySelector("h6")) {
          var spantext = element
            .getElementsByTagName("span")[0]
            .innerText.toLowerCase();
          var name = element.querySelector("h6").innerText.toLowerCase();
          if (name.includes(inputVal)) {
            notifiTxt = name;
          } else {
            notifiTxt = spantext;
          }
        } else if (element.getElementsByTagName("span")) {
          notifiTxt = element
            .getElementsByTagName("span")[0]
            .innerText.toLowerCase();
        }
        if (notifiTxt)
          element.style.display = notifiTxt.includes(inputVal)
            ? "block"
            : "none";
      });
    } else {
      dropdown.classList.remove("show");
      searchOptions.classList.add("d-none");
    }
  }

  /**
   * Search Close Btn
   */
  closeBtn() {
    var searchOptions = document.getElementById(
      "search-close-options"
    ) as HTMLAreaElement;
    var dropdown = document.getElementById(
      "search-dropdown"
    ) as HTMLAreaElement;
    var searchInputReponsive = document.getElementById(
      "search-options"
    ) as HTMLInputElement;
    dropdown.classList.remove("show");
    searchOptions.classList.add("d-none");
    searchInputReponsive.value = "";
  }
}
