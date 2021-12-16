/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';
import { BoilerplateCardConfig, EditorTarget } from './types';
import { customElement, property, state } from 'lit/decorators';
// import { assert } from 'superstruct';

const cardConfigStruct = {
  required: {
    name: 'Entidade (Opcional)',
    show: true,
  },
};

const room = "M11.4,1.4h27.2v43.1H11.4V1.4z";
const door = "M11.4 1.4v43.1h27.2V1.4H11.4zm23 23.4c0 1.1-.9 1.9-1.9 1.9h0c-1.1 0-1.9-.9-1.9-1.9V21c0-1.1.9-1.9 1.9-1.9h0c1.1 0 1.9.9 1.9 1.9v3.8z";

const includeDomains = ['switch'];
@customElement('porta-card-editor')
export class BoilerplateCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: BoilerplateCardConfig;
  @state() private _toggle?: boolean;
  @state() private _helpers?: any;
  private _initialized = false;

  public setConfig(config: BoilerplateCardConfig): void {
    this._config = config;
    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }
    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _show_name(): boolean {
    return this._config?.show_name ?? true;
  }

  get _show_state(): boolean {
    return this._config?.show_state ?? true;
  }

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _show_warning(): boolean {
    return this._config?.show_warning || false;
  }

  get _show_error(): boolean {
    return this._config?.show_error || false;
  }

  get _tap_action(): ActionConfig {
    return this._config?.tap_action || { action: 'more-info' };
  }

  get _hold_action(): ActionConfig {
    return this._config?.hold_action || { action: 'none' };
  }

  get _double_tap_action(): ActionConfig {
    return this._config?.double_tap_action || { action: 'none' };
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }
    this._helpers.importMoreInfoControl('climate');

    return html`
      <div class="card-config">
        <div class="option" .option=${'required'}>
              <ha-entity-picker
              .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.entity')} (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})"
          .hass=${this.hass}
          .value=${this._entity}
          .configValue=${'entity'}
          .includeDomains=${includeDomains}
          @value-changed=${this._valueChanged}
          allow-custom-entity>
        </ha-entity-picker>
        </div class="card-config">
        </div class="option">

    <div class="side-by-side">
        <paper-input
        .label="${this.hass.localize('ui.panel.lovelace.editor.card.generic.name')} (${this.hass.localize('ui.panel.lovelace.editor.card.config.optional')})"
        .value=${this._name}
        .configValue=${'name'}
        @value-changed=${this._valueChanged}
        ></paper-input>
    </div class="side-by-side">

    <div class="div-options">
      <p>
      </p>
        <ha-formfield
        .label=${this.hass.localize('ui.panel.lovelace.editor.card.generic.show_name')}
        .dir=${this.dir}>
        <ha-switch
          .checked=${this._show_name !== false}
          .configValue=${'show_name'}
          @change=${this._change}>
      </ha-switch>
      </ha-formfield>
      <ha-formfield
      .label=${this.hass.localize('ui.panel.lovelace.editor.card.generic.show_state')}
      .dir=${this.dir}>
      <ha-switch
        .checked=${this._show_state !== false}
        .configValue=${'show_state'}
        @change=${this._change}>
      </ha-switch>
      </ha-formfield>
      <div>

      </div>     
    </div>
    `;
  }

  private _change(ev: Event): void{
    if (!this._config || !this.hass) {
      return;
    }
    if (ev.target) {
      const target = ev.target as EditorTarget;
    const value = target.checked;
    if (this[`_${target.configValue}`] === value) {
      return;
    }

    fireEvent(this, 'config-changed', {
      config: {
        ...this._config,
        [target.configValue!]: value,
      },
    });
    }
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  private _changed_icon(ev): void {
    if (!this.hass || ev.target.selected === "") {
      return;
    }
    this._config = {
      ...this._config, [ev.target.configValue]: ev.target.selected, "type": 'custom:porta-card'
    }
    console.log("this._config", this._config);
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles(): CSSResultGroup {
    return css`
      .option {
        padding: 3% 0%;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
        display: grid;
      }
      ha-formfield {
        padding: 0px 10px 0px 20px;
        max-width: 211px;
      }
    `;
  }
}
