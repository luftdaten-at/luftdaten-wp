(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var TextareaControl = components.TextareaControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/doppelbelastung', {
        title: __('Doppelbelastung Section', 'luftdaten'),
        icon: 'chart-bar',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('Modul 4 — Doppelbelastung: Hitze + hohe Luftbelastung', 'luftdaten'),
            },
            takeaway: {
                type: 'string',
                default: '',
            },
            keyFigure: {
                type: 'string',
                default: '',
            },
            description: {
                type: 'string',
                default: __('Anzahl Tage pro Jahr, an denen „heiß" und „Ozon hoch" gleichzeitig auftreten. In Produktion: Schwellen sauber dokumentieren.', 'luftdaten'),
            },
            chartId: {
                type: 'string',
                default: 'm4Bars',
            },
            chartDataUrl: {
                type: 'string',
                default: '',
            },
            source: {
                type: 'string',
                default: __('Quelle: GeoSphere (Tmax) + UBA/EEA (O₃) — Wireframe Mock.', 'luftdaten'),
            },
            sourcePill: {
                type: 'string',
                default: __('Einheit: Tage/Jahr', 'luftdaten'),
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'luftdaten-doppelbelastung-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(TextareaControl, {
                            label: __('Takeaway', 'luftdaten'),
                            value: attributes.takeaway,
                            onChange: function(value) {
                                setAttributes({ takeaway: value });
                            },
                            help: __('Optional key takeaway message', 'luftdaten'),
                            rows: 2,
                        }),
                        el(TextControl, {
                            label: __('Key Figure', 'luftdaten'),
                            value: attributes.keyFigure,
                            onChange: function(value) {
                                setAttributes({ keyFigure: value });
                            },
                            help: __('Key figure value (e.g., "—" or a number with unit)', 'luftdaten'),
                        }),
                        el(TextareaControl, {
                            label: __('Description', 'luftdaten'),
                            value: attributes.description,
                            onChange: function(value) {
                                setAttributes({ description: value });
                            },
                            rows: 3,
                        }),
                        el(TextControl, {
                            label: __('Chart ID', 'luftdaten'),
                            value: attributes.chartId,
                            onChange: function(value) {
                                setAttributes({ chartId: value });
                            },
                            help: __('DOM ID for the chart container', 'luftdaten')
                        }),
                        el(TextControl, {
                            label: __('Chart Data API URL', 'luftdaten'),
                            value: attributes.chartDataUrl,
                            onChange: function(value) {
                                setAttributes({ chartDataUrl: value });
                            },
                            help: __('Optional URL to fetch JSON data for the chart from an external API', 'luftdaten'),
                            type: 'url',
                        }),
                        el(TextareaControl, {
                            label: __('Source', 'luftdaten'),
                            value: attributes.source,
                            onChange: function(value) {
                                setAttributes({ source: value });
                            },
                            rows: 2,
                        }),
                        el(TextControl, {
                            label: __('Source Pill Text', 'luftdaten'),
                            value: attributes.sourcePill,
                            onChange: function(value) {
                                setAttributes({ sourcePill: value });
                            },
                            help: __('Optional additional information displayed as a pill (e.g., unit)', 'luftdaten')
                        })
                    )
                ),
                el('div', { className: 'luftdaten-doppelbelastung-preview' },
                    el('section', { className: 'section', style: { marginTop: '14px', border: '1px solid #ddd', borderRadius: '18px', background: '#fff', padding: '0' } },
                        el('div', { className: 'sectionHead', style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', padding: '14px 14px 10px', borderBottom: '1px solid #ddd', background: '#f5f5f5' } },
                            el('h2', { style: { margin: 0, fontSize: '14px' } }, attributes.title || __('Modul 4 — Doppelbelastung: Hitze + hohe Luftbelastung', 'luftdaten')),
                            el('div', { className: 'takeaway', style: { color: '#666', fontSize: '12px', lineHeight: '1.35', maxWidth: '560px', textAlign: 'right' } },
                                attributes.takeaway || '—'
                            )
                        ),
                        el('div', { className: 'sectionBody', style: { padding: '12px 14px 14px' } },
                            el('div', { className: 'bigNumberRow', style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'stretch', marginBottom: '10px' } },
                                el('div', { className: 'bigNumber', style: { background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '16px', padding: '12px' } },
                                    el('div', { className: 'pill', style: { border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', color: '#666', display: 'inline-block' } }, __('Key figure', 'luftdaten')),
                                    el('div', { className: 'num', style: { fontSize: '28px', marginTop: '6px' } }, attributes.keyFigure || '—'),
                                    el('div', { className: 'desc', style: { color: '#666', fontSize: '11px', marginTop: '8px', lineHeight: '1.35' } }, attributes.description || '')
                                ),
                                el('div', { className: 'chart', style: { width: '100%', height: '320px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '14px' } },
                                    __('Chart: ', 'luftdaten') + attributes.chartId
                                )
                            ),
                            el('div', { className: 'sourceLine', style: { marginTop: '10px', color: '#666', fontSize: '11px', lineHeight: '1.35', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' } },
                                el('div', {}, attributes.source || ''),
                                attributes.sourcePill ? el('div', { className: 'pill', style: { border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', color: '#666', display: 'inline-block' } }, attributes.sourcePill) : null
                            )
                        )
                    )
                )
            );
        },
        save: function() {
            return null; // Dynamic block, rendered server-side
        },
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n
);

