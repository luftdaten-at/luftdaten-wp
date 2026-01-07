(function(blocks, element, blockEditor, components, i18n) {
    var el = element.createElement;
    var registerBlockType = blocks.registerBlockType;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;
    var __ = i18n.__;

    registerBlockType('luftdaten/citizen-science-messnetz', {
        title: __('Citizen Science Messnetz', 'luftdaten'),
        icon: 'location-alt',
        category: 'luftdaten',
        attributes: {
            mapDataUrl: {
                type: 'string',
                default: '',
            },
        },
        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'luftdaten-citizen-science-messnetz-block' },
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Block Settings', 'luftdaten'), initialOpen: true },
                        el(TextControl, {
                            label: __('Map Data API URL', 'luftdaten'),
                            value: attributes.mapDataUrl,
                            onChange: function(value) {
                                setAttributes({ mapDataUrl: value });
                            },
                            help: __('Optional URL to fetch JSON data for the Austria map (PM2.5 status)', 'luftdaten'),
                            type: 'url',
                        })
                    )
                ),
                el('div', { className: 'luftdaten-citizen-science-messnetz-preview' },
                    el('section', { className: 'section', style: { marginTop: '14px', border: '1px solid #ddd', borderRadius: '18px', background: '#fff', padding: '0' } },
                        el('div', { className: 'sectionBody', style: { padding: '12px 14px 14px' } },
                            el('div', { 
                                className: 'chart', 
                                id: 'austria-pm25-map',
                                style: { 
                                    width: '100%', 
                                    height: '500px', 
                                    background: '#f5f5f5', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    fontSize: '14px'
                                } 
                            }, __('Austria Map: PM2.5 Status', 'luftdaten'))
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

