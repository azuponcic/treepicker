(function($) {
    $(document).ready( function(e) {
        $('.coral-Modal.coral-Treepicker-picker').each(function(idx, elem) {
            var self = this;
            var n = $(this).data('fieldname');
            $('body').find('input[type="hidden"][name="' + n + '"]').each(function (index, element) {
                $('input.coral-Checkbox-input[type="checkbox"][value="' + $(element).val() + '"]', self).prop("checked", true);
            });
        });

        $('.coral-Modal label.coral-Checkbox').each(function(idx, elem) {
            var multi = $(this).closest('.coral-Modal').data('pickerMultiselect');
            if (!multi) {
                $(elem).children('input.coral-Checkbox-input').removeClass('coral-Checkbox-input').addClass('coral-Radio-input');
                $(elem).children('span.coral-Checkbox-checkmark').removeClass('coral-Checkbox-checkmark').addClass('coral-Radio-checkmark');
            }
        });

        $('body').on('change', '.coral-Modal input[type="checkbox"]', function(e) {
            var multi = $(this).closest('.coral-Modal').data('pickerMultiselect');
            if (!multi) {
                $(this).closest('.coral-Modal').find('input[type="checkbox"]:checked').each(function (idx, elem) {
                    if (elem.name !== e.target.name) {
                        $(elem).prop("checked", false);
                    }
                });
            }
        });

    });
}(window.jQuery));