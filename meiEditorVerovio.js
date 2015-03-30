require(['meiEditor'], function(){
(function ($)
{
    window.meiEditorPlugins.push((function()
    {
        var retval = 
        {
            init: function(meiEditor, meiEditorSettings)
            {
                if (!("verovioInstance" in meiEditorSettings))
                {
                    console.error("MEI Editor error: The 'VerovioEditor' plugin requires the 'verivioInstance' setting present on intialization.");
                    return false;
                }

                meiEditor.addToNavbar("Verovio", "verovio");
                $("#dropdown-verovio").append("<li><a id='update-verovio'>Update Verovio</a></li>" +
                    "<li><a id='update-dropdown'>Automatically update:<span style='float:right'><input type='checkbox' id='updateBox'/></span></a></li>");
                  
                $("#update-verovio").on('click', function()
                {
                    $("#updateVerovioModal").modal();
                });

                createModal(meiEditorSettings.element, 'updateVerovioModal', false, 
                    '<h4>Push a file to Verovio:</h4>' +
                    createSelect("Verovio", meiEditor.getPageTitles()), 'Submit');

                updateVerovio = function(pageName)
                {
                    if(pageName === undefined)
                    {
                        pageName = meiEditor.getActivePageTitle();
                    }

                    formatToSave = function(lineIn, indexIn)
                    {          
                        if (lineIn !== "") //if the line's not blank (nothing in MEI should be)
                        {
                            formattedData[indexIn] = lineIn + "\n"; //add a newline - it doesn't use them otherwise. Last line will have a newline but this won't stack when pages are re-uploaded as this also removes blank lines.
                        }
                    };
                    
                    var formattedData = meiEditor.getPageData(pageName).getSession().doc.getAllLines().join("\n"); //0-indexed

                    meiEditorSettings.verovioInstance.changeMusic(formattedData);
                };

                $("#updateVerovioModal-primary").on('click', function()
                {
                    
                    var pageName = $("#selectVerovio").find(":selected").text();
                    updateVerovio(pageName);
                    $("#updateVerovioModal-close").trigger('click');
                });

                meiEditor.events.subscribe("NewFile", function(a, fileName)
                {
                    $("#selectVerovio").append("<option name='" + fileName + "'>" + fileName + "</option>");
                });

                meiEditor.events.subscribe("PageEdited", function()
                {
                    if($("#updateBox").is(":checked"))
                    {
                        updateVerovio();
                    }
                });

                meiEditor.events.subscribe("VerovioUpdated", function(newMei)
                {
                    if(newMei === undefined) return;
                    var startRow = 0;
                    var pageTitle = meiEditor.getActivePageTitle();
                    var editorRef = meiEditor.getPageData(pageTitle);
                    while(editorRef.getSession().doc.getLine(startRow).match(/\?xml/g) !== null) startRow++;

                    var length = editorRef.session.doc.getLength();
                    var aceRange = require('ace/range').Range;
                    var range = new aceRange(startRow, 0, length, 0);

                    editorRef.getSession().doc.replace(range, newMei);
                    meiEditor.reparseAce(pageTitle);
                });

                meiEditor.edit = function(editorAction)
                {
                    meiEditorSettings.verovioInstance.edit(editorAction);
                };

                meiEditor.updateMEI = function()
                {
                    var mei = meiEditorSettings.verovioInstance.getMei();
                };

                return true;
            }
        };

        return retval;
    })());

    window.pluginLoader.pluginLoaded();

})(jQuery);

});