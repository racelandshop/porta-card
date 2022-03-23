import { SelectBase } from "@material/mwc-select/mwc-select-base";
import { styles } from "@material/mwc-select/mwc-select.css";
import { html, nothing, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { debounce } from "./utils/debouce";
import { nextRender } from "./utils/render-status";
import { localize } from "./localize/localize";
import { doorClosed, doorOpen, garageOpen, garageClosed, sidegateClosed, sidegateOpen } from "./const";

@customElement("icon-select-door")
export class IconSelect extends SelectBase {

  protected renderLeadingIcon() {
    if (!this.value) {
        return nothing;
    }
    switch (this.value) {
      case doorClosed + ":" + doorOpen:
        var viewBox = "5 -8 50 50";
        break;
      case garageClosed + ":" + garageOpen:
        var viewBox = "5 0 20 20";
        break;
      case sidegateClosed + ":" + sidegateOpen:
        var viewBox = "5 -15 50 50";
        break;
      default:
        var viewBox = "0 0 50 50";
    }

    return html`<span class="mdc-select__icon">
      <svg viewBox=${viewBox} height=20 width=24>
          <path fill="#d3d3d3" d=${this.value.split(":")[0]}/>
          <path d=${this.value.split(":")[1]}/>
        </svg>
      </span>`;
  }


  static styles = [
      styles,
      css`
        .mdc-select:not(.mdc-select--disabled) .mdc-select__icon {
          color: var(--secondary-text-color);
        }
        .mdc-select__anchor {
          width: 100%;
        }
        .mdc-select .mdc-select__anchor{
          padding-left: 40px;
        }
      `,
    ];

  connectedCallback() {
      super.connectedCallback();
      window.addEventListener("translations-updated", this._translationsUpdated);
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      window.removeEventListener("translations-updated", this._translationsUpdated);
  }

  private _translationsUpdated = debounce(async () => {
      await nextRender();
      this.layoutOptions();
  }, 500);
}

declare global {
  interface HTMLElementTagNameMap {
    "icon-select-door": IconSelect;
  }
}
