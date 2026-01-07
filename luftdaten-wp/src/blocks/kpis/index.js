(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var TextareaControl = components.TextareaControl;
    var Button = components.Button;
    var __ = i18n.__;

    registerBlockType('luftdaten/kpis', {
        title: __('KPIs Section', 'luftdaten'),
        icon: 'chart-line',
        category: 'luftdaten',
        attributes: {
            title: {
                type: 'string',
                default: __('Übersicht', 'luftdaten'),
            },
            kpis: {
                type: 'array',
                default: [
                    {
                        label: __('Aktive Stationen', 'luftdaten'),
                        value: '0',
                        unit: '',
                        trend: '',
                        note: '',
                    },
                    {
                        label: __('Messungen heute', 'luftdaten'),
                        value: '0',
                        unit: '',
                        trend: '',
                        note: '',
                    },
                    {
                        label: __('Durchschnittliche Luftqualität', 'luftdaten'),
                        value: '0',
                        unit: '',
                        trend: '',
                        note: '',
                    },
                ],
            },
            source: {
                type: 'string',
                default: '',
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            function updateKpi(index, field, value) {
                var newKpis = attributes.kpis.slice();
                newKpis[index] = Object.assign({}, newKpis[index], { [field]: value });
                setAttributes({ kpis: newKpis });
            }

            function addKpi() {
                var newKpis = attributes.kpis.slice();
                newKpis.push({
                    label: '',
                    value: '0',
                    unit: '',
                    trend: '',
                    note: '',
                });
                setAttributes({ kpis: newKpis });
            }

            function removeKpi(index) {
                var newKpis = attributes.kpis.slice();
                newKpis.splice(index, 1);
                setAttributes({ kpis: newKpis });
            }

            return el('div', { className: 'luftdaten-kpis-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Title', 'luftdaten'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        }),
                        el(TextControl, {
                            label: __('Source', 'luftdaten'),
                            value: attributes.source || '',
                            onChange: function(value) {
                                setAttributes({ source: value });
                            },
                            help: __('Optional source text displayed below the KPIs', 'luftdaten')
                        }),
                        el('div', { style: { marginTop: '20px' } },
                            el('strong', { style: { display: 'block', marginBottom: '10px' } }, __('KPIs', 'luftdaten')),
                            attributes.kpis.map(function(kpi, index) {
                                return el(PanelBody, {
                                    key: index,
                                    title: kpi.label || __('KPI', 'luftdaten') + ' ' + (index + 1),
                                    initialOpen: false
                                },
                                    el(TextControl, {
                                        label: __('Label', 'luftdaten'),
                                        value: kpi.label || '',
                                        onChange: function(value) {
                                            updateKpi(index, 'label', value);
                                        }
                                    }),
                                    el(TextControl, {
                                        label: __('Value', 'luftdaten'),
                                        value: kpi.value || '',
                                        onChange: function(value) {
                                            updateKpi(index, 'value', value);
                                        },
                                        help: __('The numeric value to display', 'luftdaten')
                                    }),
                                    el(TextControl, {
                                        label: __('Unit', 'luftdaten'),
                                        value: kpi.unit || '',
                                        onChange: function(value) {
                                            updateKpi(index, 'unit', value);
                                        },
                                        help: __('Optional unit (e.g., %, °C, µg/m³)', 'luftdaten')
                                    }),
                                    el(TextControl, {
                                        label: __('Trend', 'luftdaten'),
                                        value: kpi.trend || '',
                                        onChange: function(value) {
                                            updateKpi(index, 'trend', value);
                                        },
                                        help: __('Optional trend indicator (e.g., ↑, ↓, →)', 'luftdaten')
                                    }),
                                    el(Button, {
                                        isDestructive: true,
                                        isSmall: true,
                                        onClick: function() {
                                            if (confirm(__('Are you sure you want to remove this KPI?', 'luftdaten'))) {
                                                removeKpi(index);
                                            }
                                        },
                                        style: { marginTop: '10px' }
                                    }, __('Remove KPI', 'luftdaten'))
                                );
                            }),
                            el(Button, {
                                isPrimary: true,
                                isSmall: true,
                                onClick: addKpi,
                                style: { marginTop: '10px' }
                            }, __('Add KPI', 'luftdaten'))
                        )
                    )
                ),
                el('div', { className: 'luftdaten-kpis-preview' },
                    el('h2', { style: { fontSize: '24px', fontWeight: 600, marginBottom: '20px' } }, attributes.title || __('Übersicht', 'luftdaten')),
                    attributes.kpis.length > 0 ? el('div', { className: 'kpis-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' } },
                        attributes.kpis.map(function(kpi, index) {
                            return el('div', {
                                key: index,
                                className: 'kpi-card',
                                style: {
                                    padding: '20px',
                                    background: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }
                            },
                                el('div', { style: { fontSize: '14px', color: '#666', marginBottom: '8px' } }, kpi.label || __('KPI', 'luftdaten')),
                                el('div', { style: { fontSize: '32px', fontWeight: 700, color: '#2e88c1', display: 'flex', alignItems: 'baseline', gap: '8px' } },
                                    el('span', {}, kpi.value || '0'),
                                    kpi.unit ? el('span', { style: { fontSize: '18px', fontWeight: 400 } }, kpi.unit) : null,
                                    kpi.trend ? el('span', { style: { fontSize: '20px', marginLeft: '4px' } }, kpi.trend) : null
                                )
                            );
                        })
                    ) : el('p', { style: { color: '#666', fontStyle: 'italic' } }, __('No KPIs configured. Add KPIs in the block settings.', 'luftdaten'))
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

