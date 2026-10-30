/**
 * The settings panel's own stylesheet.
 *
 * Everything here is feature-owned: the shell's primitives draw the material,
 * the focus ring and the geometry of the controls themselves, and these rules
 * only describe what the panel adds around them. Values that belong to the shell
 * are read through its tokens rather than copied, so a token change follows
 * without touching this file.
 *
 * Kept beside the other stylesheets rather than in `theme.tsx`, which stays
 * about theme state: this is static text that changes for visual reasons alone.
 */

export const PANEL_CSS = [
  // The value pickers' trigger. Feature-owned, like DSH's own settings
  // switcher, which styles its anchor the same way: the pill is the row's
  // affordance, and everything it opens — list material, rows, scroll, focus —
  // comes from the shell's `Menu`, so only the closed face is drawn here.
  '.ct-select{box-sizing:border-box;display:inline-flex;align-items:center;gap:12px;height:36px;padding:0 14px;border:none;border-radius:18px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;white-space:nowrap;width:auto;min-width:0;max-width:100%;}',
  '.ct-select:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  // Locked while the custom theme owns the colours: dimmed and not clickable.
  '.ct-select:disabled{opacity:.5;cursor:not-allowed;}',
  '.ct-select:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  '.ct-select-label{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}',
  // The chevron stays pointing down in both states: the open list already says
  // which control it belongs to, so the trigger's arrow never flips.
  '.ct-select-chevron{flex:none;color:var(--dsw-alias-label-tertiary);display:inline-flex;}',
  '.ct-row{border-bottom:1px solid var(--dsw-alias-border-l2);padding:16px 2px;display:flex;align-items:center;gap:16px;}',
  '.ct-row:last-child{border-bottom:none;}',
  '.ct-row-flush{border-bottom:none;}',
  '.ct-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;padding-right:48px;}',
  '.ct-row-title{padding-left:3px;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px;}',
  '.ct-row-desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px;}',
  // Colour editor: one row per group, its name on the left and every seed's
  // round swatch on the right. A swatch is a plain button — it paints the seed
  // and opens the react-colorful popover anchored to it.
  '.ct-seed-row{display:flex;align-items:center;gap:16px;padding:12px 0;}',
  '.ct-seed-label{flex:0 0 auto;min-width:96px;padding-left:3px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);}',
  '.ct-seed-dots{flex:1 1 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px;}',
  // The swatch button: its shape and its border come from one `border-radius`
  // and cannot disagree with the colour fill. It is `position:relative` so the
  // popover's opening rectangle can be measured from it. No `overflow:hidden`:
  // the shell's Tooltip bubble is viewport-fixed and has to escape the circle.
  '.ct-seed-dot{position:relative;box-sizing:border-box;display:inline-block;flex:none;width:26px;height:26px;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:50%;cursor:pointer;font:inherit;}',
  '.ct-seed-dot:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  // The react-colorful popover, pinned viewport-fixed beside its swatch (fixed
  // is what keeps it out of the settings dialog's `overflow:hidden` card). The
  // frame matches the editor card's own: layer-2 fill, `radius-lg` corner, a
  // `border-l4` hairline and the prominent shadow.
  '.ct-color-pop{position:fixed;z-index:1200;box-sizing:border-box;width:224px;padding:12px;border:1px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;gap:10px;}',
  '.ct-color-pop .react-colorful{width:198px;height:170px;}',
  // The border seed's picker is the same stack with an opacity slider added, so
  // it is one control taller. Growing the box by exactly that keeps the
  // saturation panel the same size in both popovers instead of shrinking it.
  '.ct-color-pop-alpha .react-colorful{height:194px;}',
  // The drag handle, shared by all three controls. The library draws it at 28px,
  // which is wider than the 24px hue and opacity bars it rides on; capping it at
  // the bar height leaves it flush inside every control. The bars and the panel
  // stay the drag targets, so the handle is only an indicator — the shadow stays
  // the library's own.
  '.ct-color-pop .react-colorful__pointer{width:24px;height:24px;}',
  // The hex field under the gradient: the editor name field's metrics, centered
  // so a colour reads as a value rather than a sentence.
  '.ct-color-pop .ct-hex-input{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;text-align:center;outline:none;}',
  '.ct-color-pop .ct-hex-input:focus{border-color:var(--dsw-alias-border-l3);}',
  // Saved-theme cards, matching DSH's own provider rows: an outlined card with
  // the name and its "in use" dot on the left, and the row's actions on the
  // right. The active entry is marked by the dot alone, so selection never
  // competes with the hover fill.
  '.ct-list{margin-top:4px;display:flex;flex-direction:column;gap:8px;}',
  '.ct-list-row{display:flex;align-items:center;gap:10px;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l4);border-radius:16px;background:transparent;cursor:pointer;transition:border-color .16s ease,background .16s ease;}',
  '.ct-list-row:hover{background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-list-identity{display:inline-flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;}',
  // The name is clickable (loads the theme); the card's own hover fill is the
  // only cue — an underline on top of it would read as a link, not a surface.
  '.ct-list-name{min-width:0;text-align:left;border:none;background:transparent;cursor:pointer;font:inherit;font-size:14px;line-height:22px;font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0;}',
  '.ct-list-name:disabled{cursor:default;}',
  '.ct-list-actions{display:inline-flex;align-items:center;gap:4px;flex:none;margin-left:auto;}',
  // Status chip for the active card. Filled rather than outlined, so it never
  // reads as a fourth action button.
  '.ct-list-badge{display:inline-flex;align-items:center;height:28px;padding:0 10px;border-radius:14px;background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-secondary,var(--dsw-alias-label-tertiary));font-size:12px;line-height:18px;white-space:nowrap;}',
  // The chip keeps breathing room from the edit button it sits beside: the
  // actions' own 4px gap is right between the two icon buttons, but reads as
  // cramped against a filled chip, so the badge earns the extra 8px.
  '.ct-list-badge + .ct-list-btn{margin-left:8px;}',
  // The square icon action every row wears: DSH's ghost button (`Button`
  // variant `ghost`, 28x28 icon-only), so a borderless icon face sized around a
  // 14px glyph stays as large a target as the old text capsules. The fill only
  // appears on hover/active, which is what keeps the row itself the surface.
  // Its name comes from the shell's `Tooltip`, which measures the button
  // itself, so nothing here has to position an anchor for a bubble.
  '.ct-list-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:28px;width:28px;padding:0;border:none;border-radius:14px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;line-height:0;}',
  '.ct-list-btn:hover{background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-list-btn:active{background:var(--dsw-alias-interactive-bg-active);}',
  // The settings rows' focus ring, reused verbatim: a 2px `border-l3` halo, so
  // the ghost face stays invisible until it is focused or hovered.
  '.ct-list-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  // DSH's ghost dimming, so a locked row action reads as unavailable if the row
  // ever hands it `disabled`.
  '.ct-list-btn:disabled{opacity:.4;cursor:not-allowed;}',
  '.ct-list-btn:disabled:hover{background:transparent;}',
  // Tint and press fill only: same ghost face, so the pair keeps one rhythm and
  // the colour alone carries the danger.
  '.ct-list-btn-danger{color:var(--dsw-alias-state-error-primary);}',
  '.ct-list-btn-danger:hover{background:var(--dsw-alias-interactive-bg-hover-danger);}',
  '.ct-list-btn-danger:active{background:var(--dsw-alias-interactive-bg-hover-danger);}',
  // Expanded editor card: the same `radius-lg` face as a collapsed row, opened
  // up. Spacing is carried entirely by the children's own padding (no flex
  // `gap`), so the head, the colour rows and the footer sit on one 24px rhythm.
  // The radius is the token DSH's own settings editor takes, so a radius-scale
  // change follows without touching this file.
  '.ct-editor{padding:16px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-lg);background:transparent;display:flex;flex-direction:column;gap:0;}',
  '.ct-editor-head{display:flex;align-items:center;gap:10px;padding-bottom:12px;}',
  '.ct-editor-name{flex:1 1 auto;min-width:0;box-sizing:border-box;height:36px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;}',
  '.ct-editor-name::placeholder{color:var(--dsw-alias-label-tertiary);}',
  '.ct-editor-name:hover{border-color:var(--dsw-alias-border-l3);}',
  '.ct-editor-name:focus{outline:none;border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);}',
  // Light/dark segmented control: which appearance the swatches below edit. The
  // shell's `SegmentedControl` owns the track, the sliding indicator and the
  // arrow-key walk; this class only stops it shrinking beside the name field.
  '.ct-mode{flex:none;}',
  '.ct-editor-actions{display:flex;justify-content:flex-end;gap:12px;padding-top:12px;}',
  // The large calls to action that append or import a theme card. Dashed like
  // DSH's own "add" affordances on the model settings page — same 1px dashed
  // `border-l3` stroke, 44px height, `radius-lg`, one glyph each — so they read
  // as a place rather than a command.
  '.ct-add-btn{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;height:44px;margin-top:8px;padding:0 14px;border:1px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:14px;line-height:22px;}',
  '.ct-add-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);}',
  '.ct-add-btn:disabled{opacity:.4;cursor:default;}',
  '.ct-add-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-alias-border-l3);}',
  // The add row: import and add are the same affordance, so they wear the same
  // dashed face and split the row evenly. Nesting one inside the other would put
  // two buttons in one focus stop, so they are siblings here instead.
  '.ct-add-row{display:flex;align-items:stretch;gap:8px;margin-top:8px;}',
  '.ct-add-row .ct-add-btn{flex:1 1 0;width:auto;margin-top:0;min-width:0;}',
  // Confirm dialog, matching DSH's own Modal metrics: the same mask token and
  // blur, the layer-2 card on the promoted elevation, and the shell's own
  // `radius-panel` so the card's corner follows the panel scale.
  '.ct-modal-root{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;}',
  '.ct-modal-mask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,.24));backdrop-filter:var(--dsw-mask-blur,blur(2px));}',
  '.ct-modal-card{position:relative;z-index:1;display:flex;flex-direction:column;gap:12px;width:min(380px,100%);padding:24px;border-radius:var(--dsw-radius-panel);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);}',
  '.ct-modal-title{font-size:16px;line-height:24px;font-weight:600;color:var(--dsw-alias-label-primary);}',
  '.ct-modal-desc{font-size:13px;line-height:20px;color:var(--dsw-alias-label-tertiary);}',
  '.ct-modal-footer{display:flex;justify-content:flex-end;gap:12px;margin-top:12px;}',
  // What this stylesheet no longer draws: the custom-theme switch, the
  // confirmation banner and the action buttons are the shell's own `Switch`,
  // `Toast` and `Button` — their track, thumb, material, hold/fade timing,
  // geometry, fill tokens and focus ring belong to the primitives package.
  //
  // Only the two action widths and the destructive tint below are ours, and all
  // three are lifted from DSH's own dialogs rather than invented here.
  '.ct-action-cancel{min-width:72px}', // RiskConfirmation's `.modalAction`
  '.ct-action-confirm{min-width:136px}', // RiskConfirmation's `.confirmAction`
  // DSH draws a destructive action as an outlined face tinted with the error
  // token — error stroke and label over an 8% error hover — never a solid red
  // fill. The `element.class` selector keeps this ahead of the primitive's
  // `.outline` rule whatever order the two stylesheets are inserted in, and
  // rebinding the hover token on the element is DSH's own delete-button recipe.
  'button.ct-danger{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent);--dsw-alias-interactive-bg-hover:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);}',
  // --- background image/video section (inside the custom editor) ----------------
  // It sits below the colour rows and owns only its own controls: the switch,
  // buttons, segmented control and tooltip are the shell's. No hairline above
  // it — the spacing alone separates it from the rows, and a rule there only cut
  // the card in two.
  '.ct-bg-section{padding:12px 0;display:flex;flex-direction:column;gap:8px;}',
  '.ct-bg-head{display:flex;align-items:center;}',
  '.ct-bg-body{display:flex;align-items:center;gap:16px;}',
  '.ct-bg-controls{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px;}',
  // The thumbnail is the picked file's own object URL before Save, and the
  // stored asset after it, so the same face answers both states. A video fills
  // it with a clipped element rather than a CSS background.
  '.ct-bg-thumb{box-sizing:border-box;width:88px;height:56px;flex:none;overflow:hidden;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background-color:var(--dsw-alias-bg-module-platform);background-size:cover;background-position:center;}',
  '.ct-bg-thumb-video{display:block;width:100%;height:100%;object-fit:cover;object-position:center;}',
  '.ct-bg-actions{display:flex;align-items:center;gap:8px;margin-left:auto;}',
  // The wallpaper's own commands are links, not buttons: DSH's link idiom, which is
  // the accent at rest and a dotted underline once hovered or focused, so the
  // section title stays the loudest thing in the row. The accent token is also
  // the one the plugin re-hues for a custom theme, so a link never falls back to
  // DSH's blue in a theme built around another colour.
  '.ct-bg-link{box-sizing:border-box;display:inline-flex;align-items:center;height:28px;padding:0 2px;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-brand-primary);cursor:pointer;font:inherit;font-size:12px;line-height:18px;white-space:nowrap;text-decoration:none;}',
  '.ct-bg-link:hover,.ct-bg-link:focus-visible{outline:none;text-decoration:underline dotted;text-underline-offset:3px;}',
  // The switch closes that group and is its only control that is not a link: a
  // bare track against two words needs the extra room the group's own gap lacks.
  '.ct-bg-switch{margin-left:4px;}',
  // --- custom CSS row (inside the custom editor) --------------------------------
  // The stylesheet row closes the editor before its footer: the title and its
  // state hint on the left, the enable switch and the "open style file" link on
  // the right. It reuses the background section's rhythm and link idiom so the
  // card reads as one stack rather than two unrelated forms.
  '.ct-css-section{padding:12px 0;display:flex;flex-direction:column;gap:8px;}',
  '.ct-css-head{display:flex;align-items:center;}',
  '.ct-css-actions{display:flex;align-items:center;gap:8px;margin-left:auto;}',
  '.ct-css-link{box-sizing:border-box;display:inline-flex;align-items:center;padding:0 2px;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-brand-primary);cursor:pointer;font:inherit;font-size:12px;line-height:18px;white-space:nowrap;text-decoration:none;}',
  '.ct-css-link:hover,.ct-css-link:focus-visible{outline:none;text-decoration:underline dotted;text-underline-offset:3px;}',
  '.ct-css-link:disabled{opacity:.5;cursor:default;text-decoration:none;}',
  '.ct-css-switch{margin-left:4px;}',
  '.ct-bg-field{display:flex;align-items:center;gap:16px;}',
  '.ct-bg-field-label{flex:0 0 auto;min-width:108px;padding-left:3px;font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary);white-space:nowrap;font-variant-numeric:tabular-nums;}',
  // Aligned under the track, not under the label: 96px label + 16px gap + the
  // label's own 3px lead-in.
  // The shell's control package has no slider, so the two background sliders are
  // a plain range input wearing the theme's own track, thumb and focus ring.
  '.ct-range{flex:1 1 auto;min-width:0;height:20px;margin:0;padding:0;appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer;}',
  '.ct-range::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:var(--dsw-alias-border-l3);}',
  '.ct-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;margin-top:-5px;border:none;border-radius:50%;background:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-bg-layer-2);}',
  '.ct-range:focus-visible{outline:none;}',
  '.ct-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px var(--dsw-alias-border-l3);}',
].join('\n')
