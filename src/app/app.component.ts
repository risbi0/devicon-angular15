import { Component, ElementRef, ViewChild } from '@angular/core';
import { OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type icon = {
  name: string;
  tags: string[];
  color: string;
  aliases: {
    base: string;
    alias: string;
  }[];
  versions: {
    font: string[];
    svg: string[];
  };
};

type iconHtml = {
  name: string;
  main: string;
  font: string[];
  svg: string[];
};

const getLatestVersion = fetch(
  `https://api.github.com/repos/devicons/devicon/tags`
)
  .then((response) => response.json())
  .then((data) => data[0].name)
  .catch((err) => console.error(err));

const dataBaseUrl: string =
  'https://cdn.jsdelivr.net/gh/devicons/devicon@master';
let iconArray: iconHtml[] = [];

const initIcons: Promise<iconHtml[]> = fetch(`${dataBaseUrl}/devicon.json`)
  .then((response) => response.json())
  .then((icons: icon[]) => {
    icons.forEach((iconData: icon) => {
      iconArray.push({
        name: iconData.name,
        main: `${iconData.name}-${iconData.versions.font[0]}`,
        svg: iconData.versions.svg,
        font: iconData.versions.font,
      });
    });
    return iconArray;
  });

function displayTooltip(element: any, message: string): void {
  const tooltip = element.parentElement!.querySelectorAll('.tooltip')[0];
  tooltip.textContent = message;
  // reset opacity (for some reason, default opacity is null)
  tooltip.style.opacity = 1;
  tooltip.style.visibility = 'visible';

  // create fade out effect after 2 sec
  setTimeout(() => {
    let count: number = 10;
    let intervalObj: any;
    intervalObj = setInterval(() => {
      tooltip.style.opacity -= 0.1;
      if (--count == 0) {
        clearInterval(intervalObj);
        tooltip.style.visibility = 'hidden';
      }
    }, 50);
  }, 2000);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('headerLinkCode') headerLinkCode!: ElementRef;
  @ViewChild('iconClassCode') iconClassCode!: ElementRef;
  @ViewChild('imgCode') imgCode!: ElementRef;
  @ViewChild('svgCode') svgCode!: ElementRef;

  title: string = 'devicon';

  // background color related stuff
  // default is the default site background color
  defaultBackground: string = '#60BE86';
  fontBackground: string = '#60BE86';
  svgBackground: string = '#60BE86';

  // whether to display the checkerboard img in the background
  // for the font and svg respectively
  fontDisplayCheckerboard: boolean = false;
  svgDisplayCheckerboard: boolean = false;

  version: string = 'original';
  icons: any;
  colored: boolean = false;
  showFontColorPicker: boolean = false;
  showSvgColorPicker: boolean = false;

  // explicitly initialize default selected icon
  selectedIcon: iconHtml = {
    name: 'adonisjs',
    main: 'adonisjs-original',
    svg: ['original', 'original-wordmark'],
    font: ['original', 'original-wordmark'],
  };

  selectedIconFont: string = '';
  selectedSvgIcon: string = '';
  selectedFontIndexI: number = 0;
  selectedFontIndexJ: number = 0;
  selectedSvgIndex: number = 0;

  search: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    getLatestVersion.then((data) => {
      this.version = data;
    });

    initIcons.then((data) => {
      this.icons = data;
      this.selectedIconFont = data[0].font[0];
      this.selectSvg(data[0].svg[0], 0);
    });
  }

  selectFont(fontVersion: string, i: number, j: number, isColored: boolean) {
    this.selectedIconFont = fontVersion;
    this.selectedFontIndexI = i;
    this.selectedFontIndexJ = j;
    this.colored = isColored;
  }

  copyCode(event: MouseEvent, idName: string) {
    // @ts-ignore
    const code = this[idName].nativeElement.textContent as string;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        displayTooltip(event.target, 'Copied');
      })
      .catch((err) => {
        console.error('Error copying text', err);
      });
  }

  toggleFontColorPickerMenu() {
    this.showFontColorPicker = !this.showFontColorPicker;
  }

  toggleSvgColorPickerMenu() {
    this.showSvgColorPicker = !this.showSvgColorPicker;
  }

  selectSvg(svgVersion: string, index: number): void {
    this.http
      .get(
        `${dataBaseUrl}/icons/${this.selectedIcon.name}/${this.selectedIcon.name}-${svgVersion}.svg`,
        { responseType: 'text' }
      )
      .subscribe(
        (svgFile) => {
          const innerElement: string = `<${
            svgFile.match(/(?<=><).*(?=><)/)![0]
          }>`;
          this.selectedSvgIcon = innerElement;
          this.selectedSvgIndex = index;
        },
        (error) => {
          console.error('Error fetching SVG file', error);
        }
      );
  }

  selectIcon(icon: iconHtml) {
    this.selectedIcon = icon;
    this.selectedIconFont = icon.font[0];
    this.selectedFontIndexI = 0;
    this.selectedFontIndexJ = 0;
    this.colored = false;
    this.selectSvg(icon.svg[0], 0);
    // reset color
    this.fontBackground = this.defaultBackground;
    this.svgBackground = this.defaultBackground;
  }
}
