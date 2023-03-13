import { Component } from '@angular/core';
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
      const icon = {
        name: iconData.name,
        svg: iconData.versions.svg,
        font: iconData.versions.font,
        main: '',
      };

      // Loop through devicon.json icons
      for (let i = 0; i < iconData.versions.font.length; i++) {
        // Store all versions that should become main in order
        const mainVersionsArray = [
          'plain',
          'line',
          'original',
          'plain-wordmark',
          'line-wordmark',
          'original-wordmark',
        ];

        // Loop through mainVersionsArray
        for (let j = 0; j < mainVersionsArray.length; j++) {
          // Check if icon version can be 'main', if not continue, if yes break the loops
          if (
            iconData.name + iconData.versions.font[i] ==
            iconData.name + mainVersionsArray[j]
          ) {
            icon.main = iconData.name + '-' + iconData.versions.font[i];
            i = 99999; // break first loop (and second)
          }
        }
      }
      iconArray.push(icon);
    });
    return iconArray;
  });

function displayTooltop(element: any, message: string): void {
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
    svg: ['original', 'original-wordmark'],
    font: ['original', 'original-wordmark'],
    main: 'adonisjs-original',
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
    const code = document.querySelector(`#${idName}`)!.textContent as string;
    navigator.clipboard
      .writeText(code)
      .then(() => {
        displayTooltop(event.target, 'Copied');
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
