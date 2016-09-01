Dialogs = function () {

    var $dialog_login = $("#dialog-login");
    var $dialog_create = $("#dialog-form");
    var $dialog_delete = $("#dialog-delete");
    var db = $.couch.db("donors");

    this.login_dialog = function () {
        return $dialog_login.dialog({
            autoOpen: false,
            height: 400,
            width: 350,
            modal: true,
            buttons: {
                "Login": function () {
                    var data = {
                        name: $("#user").val(),
                        password: $("#password").val(),
                        success: function () {
                            $('#donors').DataTable().ajax.reload();
                            $dialog_login.dialog("close");
                        }
                    }
                    $.couch.login(data)
                },
                Cancel: function () {
                    $dialog_login.dialog("close");
                }
            },
            close: function () {
                form[0].reset();
            }
        })
    }

    var addUser = function () {
        var doc = {
            name: $("#name").val(),
            location: $("#location").val(),
            date: $("#date").val(),
            amount: $("#amount").val()
        }
        $.post("http://" + window.location.host + "/donors/_design/donors/_update/donor", doc,
            function (data) {
                $('#donors').DataTable().ajax.reload();
                $dialog_create.dialog("close");
            }
        );
    };

    var form = $dialog_delete.find("form").on("submit", function (event) {
        event.preventDefault();
        addUser();
    });

    this.create_dialog = function () {
        return $dialog_create.dialog({
            autoOpen: false,
            height: 400,
            width: 350,
            modal: true,
            buttons: {
                "Create donor": addUser,
                Cancel: function () {
                    $dialog_create.dialog("close");
                }
            },
            close: function () {
               // form[0].reset();
            }
        });
    }

    this.delete_dialog = function () {
        return $dialog_delete.dialog({
            autoOpen: false,
            height: 200,
            width: 220,
            modal: true,
            buttons: {
                "Delete": function () {
                    var table = $('#donors').DataTable();
                    var data = table.row({selected: true}).data()
                    var doc = {_id: data[0], _rev: data[1]};
                    db.removeDoc(doc, {
                        success: function (data) {
                            table.button(1).disable();
                            table.button(2).disable();
                            table.ajax.reload();
                        },
                    })
                    $dialog_delete.dialog("close");
                },
                Cancel: function () {
                    $dialog_delete.dialog("close");
                }
            },
            close: function () {
            }
        });
    }
}


///////// Start main procedure ///////////////

$(function () {
        var dialogs = new Dialogs();
        var login_dialog = dialogs.login_dialog();
        var create_dialog = dialogs.create_dialog();
        var delete_dialog = dialogs.delete_dialog();
        var table;
        var db = $.couch.db("donors");

        $("#date").datepicker();
        $("#amount").selectmenu();
        //form = create_dialog.find("form").on("submit", function (event) {
        //    event.preventDefault();
        //    addUser();
        //});

        table = $('#donors').DataTable(
            {
                select: {
                    style: 'single'
                },
                buttons: [
                    {
                        text: 'New',
                        action: function (e, dt, node, config) {
                            create_dialog.dialog("open");
                        }
                    },
                    {
                        text: 'Edit',
                        action: function (e, dt, node, config) {
                            alert('Button activated');
                        }
                    },
                    {
                        text: 'Delete',
                        action: function (e, dt, node, config) {
                            delete_dialog.dialog("open");
                        }
                    }
                ],
                ajax: function (data1, callback, settings) {
                    db.view("donors/donors", {
                        success: function (data2) {
                            data3 = []
                            for (idx in data2.rows) {
                                data3.push(data2.rows[idx].value);
                            }
                            callback({"data": data3})
                        },
                        error: function(e){if (e==401) login_dialog.dialog("open")}
                    });
                    callback({
                        "data": []
                    });
                }

            }
        );
        table
            .on('select', function (e, dt, type, indexes) {
                table.button(1).enable();
                table.button(2).enable();
            })
            .on('deselect', function (e, dt, type, indexes) {
                table.button(1).disable();
                table.button(2).disable();
            });
        table.buttons().container()
            .insertBefore('#donors_filter');
        table.button(1).disable();
        table.button(2).disable();
        table.columns(0).visible(false);
        table.columns(1).visible(false);
    }
);
