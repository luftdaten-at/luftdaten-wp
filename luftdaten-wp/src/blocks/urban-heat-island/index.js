(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var TextareaControl = components.TextareaControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/urban-heat-island', {
        title: __('Urban Heat Island Section', 'luftdaten'),
        icon: 'chart-area',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('Modul 3 — Urban Heat Island: Nächte werden zum Problem', 'luftdaten'),
            },
            takeaway: {
                type: 'string',
                default: '',
            },
            chart1Label: {
                type: 'string',
                default: __('Tropennächte', 'luftdaten'),
            },
            chart1Id: {
                type: 'string',
                default: 'm3TropicalNights',
            },
            chart1DataUrl: {
                type: 'string',
                default: '',
            },
            chart2Label: {
                type: 'string',
                default: __('UHI-Indikator', 'luftdaten'),
            },
            chart2Id: {
                type: 'string',
                default: 'm3UhiDelta',
            },
            chart2DataUrl: {
                type: 'string',
                default: '',
            },
            source: {
                type: 'string',
                default: __('Quelle: GeoSphere (Stations-/Indexdaten) — im Wireframe Mock.', 'luftdaten'),
            },
            sourcePill: {
                type: 'string',
                default: __('Tropennächte: Tmin ≥ 20°C (Beispiel)', 'luftdaten'),
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'luftdaten-urban-heat-island-block' },
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
                        el('hr', { style: { margin: '20px 0' } }),
                        el('strong', { style: { display: 'block', marginBottom: '10px' } }, __('Chart 1 (Left)', 'luftdaten')),
                        el(TextControl, {
                            label: __('Chart 1 Label', 'luftdaten'),
                            value: attributes.chart1Label,
                            onChange: function(value) {
                                setAttributes({ chart1Label: value });
                            }
                        }),
                        el(TextControl, {
                            label: __('Chart 1 ID', 'luftdaten'),
                            value: attributes.chart1Id,
                            onChange: function(value) {
                                setAttributes({ chart1Id: value });
                            },
                            help: __('DOM ID for the first chart container', 'luftdaten')
                        }),
                        el(TextControl, {
                            label: __('Chart 1 Data API URL', 'luftdaten'),
                            value: attributes.chart1DataUrl,
                            onChange: function(value) {
                                setAttributes({ chart1DataUrl: value });
                            },
                            help: __('Optional URL to fetch JSON data for the first chart', 'luftdaten'),
                            type: 'url',
                        }),
                        el('hr', { style: { margin: '20px 0' } }),
                        el('strong', { style: { display: 'block', marginBottom: '10px' } }, __('Chart 2 (Right)', 'luftdaten')),
                        el(TextControl, {
                            label: __('Chart 2 Label', 'luftdaten'),
                            value: attributes.chart2Label,
                            onChange: function(value) {
                                setAttributes({ chart2Label: value });
                            }
                        }),
                        el(TextControl, {
                            label: __('Chart 2 ID', 'luftdaten'),
                            value: attributes.chart2Id,
                            onChange: function(value) {
                                setAttributes({ chart2Id: value });
                            },
                            help: __('DOM ID for the second chart container', 'luftdaten')
                        }),
                        el(TextControl, {
                            label: __('Chart 2 Data API URL', 'luftdaten'),
                            value: attributes.chart2DataUrl,
                            onChange: function(value) {
                                setAttributes({ chart2DataUrl: value });
                            },
                            help: __('Optional URL to fetch JSON data for the second chart', 'luftdaten'),
                            type: 'url',
                        }),
                        el('hr', { style: { margin: '20px 0' } }),
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
                            help: __('Optional additional information displayed as a pill', 'luftdaten')
                        })
                    )
                ),
                el('div', { className: 'luftdaten-urban-heat-island-preview' },
                    el('section', { className: 'section', style: { marginTop: '14px', border: '1px solid #ddd', borderRadius: '18px', background: '#fff', padding: '0' } },
                        el('div', { className: 'sectionHead', style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', padding: '14px 14px 10px', borderBottom: '1px solid #ddd', background: '#f5f5f5' } },
                            el('h2', { style: { margin: 0, fontSize: '14px' } }, attributes.title || __('Modul 3 — Urban Heat Island: Nächte werden zum Problem', 'luftdaten')),
                            el('div', { className: 'takeaway', style: { color: '#666', fontSize: '12px', lineHeight: '1.35', maxWidth: '560px', textAlign: 'right' } },
                                attributes.takeaway || '—'
                            )
                        ),
                        el('div', { className: 'sectionBody', style: { padding: '12px 14px 14px' } },
                            el('div', { className: 'grid2', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' } },
                                el('div', { style: { border: '1px solid #ddd', borderRadius: '16px', padding: '12px', background: '#f5f5f5' } },
                                    el('div', { className: 'pill', style: { border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', color: '#666', display: 'inline-block', marginBottom: '10px' } }, attributes.chart1Label || __('Tropennächte', 'luftdaten')),
                                    el('div', { className: 'chart small', style: { width: '100%', height: '200px', background: '#fff', border: '1px solid #ddd', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' } },
                                        __('Chart: ', 'luftdaten') + attributes.chart1Id
                                    )
                                ),
                                el('div', { style: { border: '1px solid #ddd', borderRadius: '16px', padding: '12px', background: '#f5f5f5' } },
                                    el('div', { className: 'pill', style: { border: '1px solid #ddd', background: '#fff', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', color: '#666', display: 'inline-block', marginBottom: '10px' } }, attributes.chart2Label || __('UHI-Indikator', 'luftdaten')),
                                    el('div', { className: 'chart small', style: { width: '100%', height: '200px', background: '#fff', border: '1px solid #ddd', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' } },
                                        __('Chart: ', 'luftdaten') + attributes.chart2Id
                                    )
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

