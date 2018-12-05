/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import LitElement, { customElement, property, html, PropertyValues } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-radio-button")
export default class RadioButton extends LitElement
{
    static readonly shady = true;

    @property({ type: Boolean })
    checked = false;

    constructor()
    {
        super();
        console.log("Checkbox.constructor");
    }

    protected render()
    {
        return html`
            <style>
                 /* Customize the label (the container) */
                label {
                  display: block;
                  position: relative;
                  padding-left: 35px;
                  margin-bottom: 12px;
                  cursor: pointer;
                  font-size: 22px;
                  -webkit-user-select: none;
                  -moz-user-select: none;
                  -ms-user-select: none;
                  user-select: none;
                }
                
                /* Hide the browser's default checkbox */
                input {
                  position: absolute;
                  opacity: 0;
                  cursor: pointer;
                  height: 0;
                  width: 0;
                }
                
                /* Create a custom checkbox */
                .checkmark {
                  position: absolute;
                  top: 0;
                  left: 0;
                  height: 25px;
                  width: 25px;
                  background-color: #eee;
                }
                
                /* On mouse-over, add a grey background color */
                label:hover input ~ .checkmark {
                  background-color: #ccc;
                }
                
                /* When the checkbox is checked, add a blue background */
                input:checked ~ .checkmark {
                  background-color: #2196F3;
                }
                
                /* Create the checkmark/indicator (hidden when not checked) */
                .checkmark:after {
                  content: "";
                  position: absolute;
                  display: none;
                }
                
                /* Show the checkmark when checked */
                input:checked ~ .checkmark:after {
                  display: block;
                }
                
                /* Style the checkmark/indicator */
                .checkmark:after {
                  left: 9px;
                  top: 5px;
                  width: 5px;
                  height: 10px;
                  border: solid white;
                  border-width: 0 3px 3px 0;
                  -webkit-transform: rotate(45deg);
                  -ms-transform: rotate(45deg);
                  transform: rotate(45deg);
                } 
            </style>
            <label>
            <slot></slot>
            <input type="checkbox" ?checked=${this.checked}>
            <span class="checkmark"</span>
            </label>
        `;
    }
}