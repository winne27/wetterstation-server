      $.datepicker.setDefaults( $.datepicker.regional["de"]);
      $("#TagDatum").datepicker(
      {
         dateFormat: "d. MM yy",
         altFormat: "yy-mm-dd",
         minDate: "2. Juni 2009",
         maxDate: "+0d",
         changeMonth: true,
         changeYear: true,
         beforeShow : function(input, inst)
         {
             $('#ui-datepicker-div').removeClass('monthPickerWindow');
         },
         onSelect: function(value,date)
         {
              var dateObj = $(this).datepicker("getDate");
              var TagDatum = $.datepicker.formatDate("yy-mm-dd", dateObj);
              app.getSpecificData(TagDatum,'Tag');
         }
      })
      $("#TagDatum").datepicker( "setDate", app.heute.Tag);
      setArrows.Tag();