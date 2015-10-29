//---- Translate ----//
var trans_EnterToEdit = 'กด Enter เพื่อตั้งชื่อ';
var trans_untited = 'lineup ไม่ได้ตั้ง...';

var new_width = "";
var new_height = "";

//Object
var teamBody = '.teamBody'; //div
var teamSize = '#size_w';
var teamFieldDiv = '';

//ขนาดภาพต้นฉบับ
arrayOriginalWH = [
    {
        width: '350',
        height: '471'
    }
];
arrayData = [];

//function คำนวณ scale
function calc_coord(original_xy, original_WH, new_WH) {
    return Math.floor(new_WH * (original_xy / original_WH));
};
function calc_scale(original_width, original_height, new_width) {
    return (original_height / original_width) * new_width; //got new_height
}


//เมื่อปรับขนาด
window.onresize = function() {
    applyCoordinates();
};

function applyCoordinates() {
    for (i=0;i<11;i++) {
        setTokenOffset('#fld1tkn'+(i+1), arrayData[i].offX, arrayData[i].offY);
        setTokenArrows('#fld1tkn'+(i+1), arrayData[i].arrow1, arrayData[i].arrow2, arrayData[i].arrow3)
    }
}

var app = angular.module("lineup",[]);
app.controller('player', function($scope) {
    $scope.A = 60;
    $scope.setImage = function(num) {
        console.log(num);
    }
});

/* --- APPLICATION --- */
$(document).ready(function () {
    //Globals
    //var applyInterval = setInterval(function() { applyCoordinates(); clearInterval(applyInterval); }, 1000);

    window.pDefault = '11';
    window.aDefault = '40402';
    window.tDefault = '';
    window.cDefault = 'dc0000';
    window.c2Default = 'FFFFFF';
    window.c3Default = 'FFFFFF';

    /*
     window.posGKx = '175'; 	window.posGKy = '389';

     window.posDRx = '287'; 	window.posDRy = '303';
     window.posDCRx = '215'; window.posDCRy = '327';
     window.posSWx = '175'; 	window.posSWy = '335';
     window.posDCLx = '137'; window.posDCLy = '327';
     window.posDLx = '61'; 	window.posDLy = '303';

     window.posMDRx = '215'; window.posMDCy = '277';
     window.posMDCx = '175'; window.posMDCy = '277';
     window.posMDLx = '137'; window.posMDLy = '277';

     window.posMRx = '287'; 	window.posMRy = '213';
     window.posMCRx = '215'; window.posMCRy = '223';
     window.posMCx = '175'; 	window.posMCy = '223';
     window.posMCLx = '137'; window.posMCLy = '223';
     window.posMLx = '61';	window.posMLy = '213';

     window.posARx = '273'; 	window.posARy = '158';
     window.posACRx = '215'; window.posACRy = '144';
     window.posACx = '175'; 	window.posACy = '153';
     window.posACLx = '137'; window.posACLy = '144';
     window.posALx = '78'; 	window.posALy = '158';

     window.posWRx = '287'; 	window.posWRy = '115';
     window.posFCRx = '215'; window.posFCRy = '101';
     window.posFCx = '175'; 	window.posFCy = '77';
     window.posFCLx = '137'; window.posFCLy = '101';
     window.posWLx = '61'; 	window.posWLy = '115';
     */

    $('FORM').submit(function () {
        if (!$(this).hasClass('submitable')) {
            return false;
        }
    });

});


/* --- เมาส์ชี้หัวอักษร --- */
$(document).ready(function () {

    $('.arrowhead').hover(
        function () {
            $(this).closest('.arrow').addClass('selected');
        },
        function () {
            $(this).closest('.arrow').removeClass('selected');
        }
    );

    $('.editable .arrowhead').draggable({
        containment: '.field',
        drag: function (event, ui) {

            var arrow = $(this).closest('.arrow');
            $(arrow).addClass('modified');

            // Center (c)
            var token = $(this).closest('.token');
            var centerX = $(token).offset().left + 15;
            var centerY = $(token).offset().top + 15;

            // Mouse (n)
            var mouseX = event.pageX;
            var mouseY = event.pageY;

            // Hipotenuse, arrow new height (m)   m2 = a2 + b2
            var a = mouseX - centerX;
            var b = mouseY - centerY;
            var newHeight = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

            // Rotation angle (y)   y = arccos(zDistance/newHeight)
            var zDistance = centerY - mouseY;
            var moveAngle = Math.acos(zDistance / newHeight);
            moveAngle = moveAngle * (180 / Math.PI);
            if (a < 0) {
                moveAngle = 360 - moveAngle;
            }

            var rotateCSS = 'rotate(' + moveAngle + 'deg)';
            $(arrow).css({
                'height': newHeight,
                '-webkit-transform': rotateCSS,
                '-ms-transform': rotateCSS,
                '-moz-transform': rotateCSS,
                '-o-transform': rotateCSS,
                'transform': rotateCSS
            });

            // Arrowhead allways in place.
            $(this).css({
                'position': 'static'
            });

            if (newHeight <= 40) {
                $(arrow).removeClass('modified');
                $(arrow).attr('style', '');
            }

            exportUrlUpdate();
        },
        start: function () {
            $(this).closest('.arrow').addClass('moving');
        },
        stop: function (event, ui) {
            $(this).closest('.arrow').removeClass('moving');
        }
    });

});


/* --- LOAD LINEUP --- */

function urv(a, b, d) {//get variables from URL; a = varname, b = default [, d = document]
    if (d === '') {
        d = (d ? d : document);
        d = d.location.search;
    }
    var i = d.toLowerCase().indexOf(a.toLowerCase() + "=");
    if (i > 0) {
        var j = d.indexOf("&", i);
        if (j < 0 || d.indexOf("?", i) > -1) {
            j = d.length;
        }
        ; //if var contains ?, dont cut on &
        b = d.substring(i + (a.length) + 1, j);
    }
    ;
    return (unescape(b));
}


/* --- MATCH --- //
 - players : 11

 + initMatch(match)
 + setMatch(match, players)
 + setMatchPlayers(match, players)
 */

$(function () {
    $('.team').each(function () {
        initMatch(this);
        $('.noticeLoading').hide();
        $('.field.loading').removeClass('loading');
    });
});

$(function () {
    $('SELECT.matchPlayers').change(function () {
        var match = $(this).closest('.team');
        var players = $(this).find('OPTION:selected').val();
        setMatch(match, players);
    });
});

$(function () {
    startup();
});

//ฟังชั่น Set team ปุ่มก็มาเรียก
function startup() {
    $('.team').each(function () {
        initTeam(this);
    });
    applyCoordinates();
}

function initMatch(match) {
    var vars = $('#fld1vars').val();
    vars = vars !== '' ? '?' + vars : '';
    var players = urv("p", pDefault, vars);
    setMatch(match, players);
}

function setMatch(match, players) {
    setMatchPlayers(match, players);
    exportUrlUpdate();
}

//จำนวนผู้เล่น
function setMatchPlayers(match, players) {
    $('SELECT.matchPlayers OPTION[value="' + players + '"]').attr('selected', true);
    var tokens = $(match).find('.token');
    $(tokens).each(function (index) {
        if (players < index + 1) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
    // Set alignment to custom for less than 11 players in the field.
    var select = $(match).find('SELECT.teamAlignment');
    var optionsToDisable = $(select).find('OPTION').filter(':not(.custom)');
    //ถ้าผู้เล่นไม่ใช่ 11 คน ไม่ให้เลือกแผน
    if (players != 11) {
        $(optionsToDisable).each(function () {
            $(this).attr('disabled', 'disabled');
        });
        $(match).find('SELECT.teamAlignment OPTION.custom').attr('selected', true);
    } else {
        $(optionsToDisable).each(function () {
            $(this).attr('disabled', '');
        });
    }
}


/* --- TEAM --- //
 - name : Liverpool FC
 - color : DC0000
 - align : 40231
 - players : Tokens

 + initTeam(team)
 + initColorPicker()
 + setTeam(team, name, color, align, players)
 + setTeamName(team, name)
 + setTeamColor(team, color)
 + setTeamAlign(team, align)
 + setTeamPlayers(team, players)
 */

function initTeam(team) {
    var vars = $('#fld1vars').val();
    vars = vars !== '' ? '?' + vars : '';
    var playerNum = urv("p", pDefault, vars);
    var name = urv("t", tDefault, vars);
    name = unescape(name);
    var color = urv("c", cDefault, vars);
    var color2 = urv("c2", c2Default, vars);
    var color3 = urv("c3", c3Default, vars);
    var align = urv("a", aDefault, vars);
    var players = [];
    players[0] = urv("1", "", vars);
    players[1] = urv("2", "", vars);
    players[2] = urv("3", "", vars);
    players[3] = urv("4", "", vars);
    players[4] = urv("5", "", vars);
    players[5] = urv("6", "", vars);
    players[6] = urv("7", "", vars);
    players[7] = urv("8", "", vars);
    players[8] = urv("9", "", vars);
    players[9] = urv("10", "", vars);
    players[10] = urv("11", "", vars);
    setTeam(playerNum, team, name, color, color2, color3, align, players);
    initColorPicker(color, color2, color3);
    exportUrlUpdate();
}


function initColorPicker(c, c2, c3) {
    /*
     if(c == 'fcb') {
     $('#colorSelector').ColorPicker({
     color: '2B2295',
     onChange: function (hsb, hex, rgb) {
     $('#colorSelector div').css('backgroundColor', '#2b2295');
     $('.tknPos').css('backgroundColor', '#2b2295');
     $('.tknPos').css('borderColor', '#d82b01');
     $('.tknPos').css('color', '#f6f403');
     exportUrlUpdate();
     }
     });

     } else {
     */
    $('#colorSelector').ColorPicker({
        color: c,
        onChange: function (hsb, hex, rgb) {
            $('#colorSelector div').css('backgroundColor', '#' + hex);
            $('.tknPos').css('backgroundColor', '#' + hex);
            exportUrlUpdate();
        }
    });
    $('#colorSelectorBorder').ColorPicker({
        color: c2,
        onChange: function (hsb, hex, rgb) {
            $('#colorSelectorBorder div').css('backgroundColor', '#' + hex);
            $('.tknPos').css('borderColor', '#' + hex);
            exportUrlUpdate();
        }
    });
    $('#colorSelectorNum').ColorPicker({
        color: c3,
        onChange: function (hsb, hex, rgb) {
            $('#colorSelectorNum div').css('backgroundColor', '#' + hex);
            $('.tknPos').css('color', '#' + hex);

            if (hsb.b < 50) {
                $('.field').addClass('textShadowDark')
            } else {
                $('.field').removeClass('textShadowDark');
            }
            exportUrlUpdate();
        }
    });
//	}
}

function setTeam(playerNum, team, name, color, color2, color3, align, players) {
    setTeamName(team, name);
    setTeamColor(team, color, color2, color3);
    setTeamAlign(team, align);
    setTeamPlayers(playerNum, players); //team,


}


$(function () {

    $('INPUT[name="team_name"]').keyup(function () {
        exportUrlUpdate();
    });

    $('INPUT[name="team_name"]').focus(function () {
        $(this).select();
    });

    $('INPUT[name="team_name"]').blur(function () {
        exportUrlUpdate();
    });

});

function setTeamName(team, name) {
    var input = $(team).find('INPUT[name="team_name"]');
    $(input).val(name);
    $(input).blur();
    if (name.length > 0) {
        $(input).removeClass('hint');
    }
}

function setTeamColor(team, color, color2, color3) {

    /*
     if(color == 'fcb') {
     $('#colorSelector div').css('backgroundColor', '#2b2295');
     $('.tknPos').css('backgroundColor', '#2b2295');
     $('.tknPos').css('borderColor', '#d82b01');
     $('.tknPos').css('color', '#f6f403');

     } else {
     */
    $('#colorSelector div').css('backgroundColor', '#' + color);
    $('#colorSelectorBorder div').css('backgroundColor', '#' + color2);
    $('#colorSelectorNum div').css('backgroundColor', '#' + color3);
    $('.tknPos').css({
        'backgroundColor': '#' + color,
        'borderColor': '#' + color2,
        'color': '#' + color3,
    });

    // Dark text shadow
    var numColor = hexToRgb(color3);
    var numHSV = rgb2hsv(numColor.r, numColor.g, numColor.b);
    if (numHSV.v < 50) {
        $('.field').addClass('textShadowDark')
    } else {
        $('.field').removeClass('textShadowDark');
    }

//	}

}

$(function () {
    $('SELECT.teamAlignment').change(function () {
        var team = $(this).closest('.team');
        var align = $(this).find('OPTION:selected').val();
        $('.token').each(function () {
            $(this).attr('style', '');
        });
        setTeamAlign(team, align);
        exportUrlUpdate();
    });
});

function setTeamAlign(team, align) {
    var select = $(team).find('SELECT.teamAlignment');
    var alignOption = $(select).find('OPTION[value="' + align + '"]');
    var alignPos = $(alignOption).attr('pos');
    $(alignOption).attr('selected', true);
    var tokens = $(select).closest('.team').find('.field .token');
    alignPos = alignPos.split(',');
    $(tokens).each(function (index) {
        setTokenPos(this, alignPos[index]);
    });
}

//LOOP SET
function setTeamPlayers(playerNum, players) {
    //LOOP START HERE
    arrayData = []; //clear  ArrayFirst
    $(players).each(function (index) {
        if (index < playerNum) {
            var chunks = this.split("_");
            var id = index + 1;
            var pos = chunks[0];
            var name = chunks[1];
            name = unescape(name);
            var num = chunks[2];
            var offsetX = chunks[3];
            var offsetY = chunks[4];
            var arrow1 = chunks[5];
            var arrow2 = chunks[6];
            var arrow3 = chunks[7];
            initToken(id, pos, num, name, offsetX, offsetY, arrow1, arrow2, arrow3);

            //คัดลอกทุกอย่างลง VAR ปล. function each loop
            //arrayData.width = 350;
            arrayData.push({offX: offsetX, offY: offsetY, origin_offX: offsetX, origin_offY: offsetY, arrow1: arrow1, arrow2: arrow2, arrow3: arrow3});

        } else {
            var id = index + 1;
            var pos = '';
            var name = '';
            var num = '';
            var offsetX = '';
            var offsetY = '';
            var arrow1 = '';
            var arrow2 = '';
            var arrow3 = '';
            initToken(id, pos, num, name, offsetX, offsetY, arrow1, arrow2, arrow3);
        }
    });
}


/* --- TOKEN --- //
 - id : 3
 - pos : DCL
 - num : 5
 - name : Agger
 - offsetX : 0
 - offsetY : 0
 - arrow1 : height-angle
 - arrow2 : 45-240
 - arrow3 : 0

 + initToken()
 + initTokenSelect()
 + tokenSelect()
 + initTokenUnselect()
 + tokenUnselect()
 + initTokenKeypress()
 + initTokenMove()
 + setToken(id, pos, num, name, offsetX, offsetY)
 + setTokenPos(token, pos)
 + setTokenLabel(token)
 + setTokenNum(token, num)
 + setTokenName(token, name)
 + setTokenOffset(token, offsetX, offsetY)
 */
function initToken(id, pos, num, name, offsetX, offsetY, arrow1, arrow2, arrow3) {
    var newToken = $('fld1tkn' + id);
    initTokenSelect();
    initTokenUnselect();

    initTokenMove();

    //arrayData.offX = offsetX;
    //arrayData.offY = offsetX;
    //arrayData.origin_offX = offsetX;
    //arrayData.origin_offY = offsetY;


    //โยน
    setToken(id, pos, num, name, offsetX, offsetY, arrow1, arrow2, arrow3);
    exportUrlUpdate();
}


function initTokenSelect() {
    $('.field .token').click(function () {
        tokenSelect(this);
    });
}

function tokenSelect(token) {
    var isEditable = $(token).closest('.editable');
    if (isEditable.length > 0) {
        $('.token.selected').removeClass('selected');

        $(token).addClass('selected');
        $(token).find('.tknPos').css('background-image', 'url(../images/man/01.jpg)');
        //$(token).css('background-image', 'url(../images/man/01.jpg)');
        console.log('sel'+isEditable.length+'');
    }
    /*
     if(!$(token).hasClass('posGK')) {
     $(token).find('.arrow3').length <= 0 ? $(token).prepend('<div class="arrow arrow3"><div class="arrowhead"></div></div>') : '';
     $(token).find('.arrow2').length <= 0 ? $(token).prepend('<div class="arrow arrow2"><div class="arrowhead"></div></div>') : '';
     $(token).find('.arrow1').length <= 0 ? $(token).prepend('<div class="arrow arrow1"><div class="arrowhead"></div></div>') : '';
     }
     */
}


function initTokenUnselect() {
    $('.field .token.selected, .field .token .tknName').mouseup(function () {
        return false
    });
    $(document).mouseup(function (e) {
        if ($(e.target).closest(".selected").length == 0) {
            var token = $('.token.selected');
            tokenUnselect(token);
        }
    });
}

function tokenUnselect(token) {
    $(token).removeClass('selected');
    //$(token).find('.tknPos').css('background-image','');
    var text = $(token).find('.text');
    var textVal = $(text).find('INPUT').val();
    var plyrName = $(token).find('.tknName').attr('data-name');
    if (typeof(textVal) != 'undefined') {
        tokenSplitNames(token, textVal);
    }
    $(text).html(textVal);
    $(token).removeClass('editing');
    var textString = $(text).text();
    if (textString != '' && textString != trans_EnterToEdit) {
        $(token).removeClass('empty');
    } else {
        $(token).addClass('empty');
        $(text).text(trans_EnterToEdit);
        $(token).find('.tknPos').html('');
        setTokenLabel($(token));
    }
    /*
     $("meta[property='og\\:description']").attr("content", getPreviewNames());
     $('#previewNames').text(getPreviewNames());
     */
}

//แบ่งการใช้คำ
function tokenSplitNames(token, name) {
    $(token).find('.tknName').attr('data-name', name);
    var text = $(token).find('.tknName');
    var players = name.split('/');
    var names = '';
    $(players).each(function () {
        // Ratings
        var secLabel = this.match(/\[(.*?)\]/g);
        if (secLabel) {
            secLabel = secLabel[0];
            secLabel = secLabel.replace(/\[/, '');
            secLabel = secLabel.replace(/\]/, '');

            secLabel = ( 0.0 + parseFloat(secLabel, 1) ).toFixed(1);
            secLabel = isNaN(secLabel) ? '-' : secLabel;

            var rating = ' <span class="rating">' + secLabel + '</span>';
        } else {
            var rating = '';
        }

        var priLabel = this.replace(/\[(.*?)\]/g, '');

        // Captain
        var isCaptain = priLabel.match(/\([C|c]\)/g);
        var classCaptain = isCaptain ? ' captain' : '';
        // HTML
        var plyrName = priLabel.replace(/\([C|c]\)/g, '').trim();
        plyrName = plyrName.replace(/\d+/g, '');
        plyrName = plyrName.trim();
        names += '<span class="plyr' + classCaptain + '">' + plyrName + rating + '</span><br/>';
    });
    $(text).html('<span class="text">' + names + '</span>');
}

//เมื่อกด Enter
$(function () {
    $(window).keypress(function (e) {
        if (e.keyCode == 13) {

            e.preventDefault();
            var editing = $('.field .token.editing');
            var selected = $('.field .token.selected');

            if (editing.length > 0) {
                var text = $(editing).find('.text');
                var textVal = $(text).find('INPUT').val();
                $(editing).find('.tknName').attr('data-name', textVal);
                var tokenNumString = textVal.replace(/\[(.*?)\]/g, '').trim();
                var tokenNum = tokenNumString.match(/\d+/g);
                if (tokenNum) {
                    tokenNum = tokenNum.toString();
                    setTokenNum(selected, tokenNum);
                    //textVal = tokenNumString.replace(/\d+/g,'');
                    //$(text).find('INPUT').val(textVal.trim());
                } else {
                    $(editing).find('.num').remove();
                    setTokenLabel($(selected));
                }
                tokenUnselect(selected);

            } else if (selected.length > 0) {
                var text = $(selected).find('.text');
                //var textVal = $(text).text();
                var textVal = $(selected).find('.tknName').attr('data-name');
                /*
                 var tokenNum = $(selected).find('.num').text();
                 if(tokenNum.length > 0) {
                 textVal = tokenNum + ' ' + textVal;
                 }
                 */
                if (textVal == trans_EnterToEdit) {
                    console.log("on typing!");
                    $(text).html('<input type="text" value="" />');
                } else {
                    $(text).html('<input type="text" value="' + textVal + '" />');
                }
                $(text).find('INPUT').focus();
                $(text).find('INPUT').select();
                $(selected).addClass('editing');
            }
            exportUrlUpdate();
        }
    });
});

//เมื่อลากผู้เล่น
function initTokenMove() {
    //ถ้าไม่ใช่ Goal ลากได้
    $('.field.editable .token').filter(':not(.posGK)').draggable({
        //helper: 'clone',
        //scroll: true,
        containment: '.field',
        cancel: '.tknName, .arrow',
        start: function () {
            $(this).addClass('fade');
            tokenSelect(this);
        },
        stop: function () {
            $(this).removeClass('fade');
            pos = setTokenLabel($(this));
            setTokenPos(this, pos);
            $(this).closest('.team').find('.teamAlignment .custom').attr('selected', true);
            exportUrlUpdate();
        }
    });
}


function setToken(id, pos, num, name, offsetX, offsetY, arrow1, arrow2, arrow3) {
    var token = $('#fld1tkn' + id);
    setTokenPos(token, pos);
    setTokenName(token, name);
    setTokenLabel($(token));
    setTokenOffset(token, offsetX, offsetY);
    setTokenArrows(token, arrow1, arrow2, arrow3);
    setTokenNum(token, num);
}


function setTokenPos(token, pos) {
    if (pos != '') {
        var tokenClasses = $(token).attr('class');
        var tokenPosClass = tokenClasses.match(/pos\w+/g).toString();
        $(token).removeClass(tokenPosClass);
        $(token).addClass('pos' + pos);

        var tokenPos = pos.substring(0, 2);
        if (tokenPos == 'MD') {
            tokenPos == 'DM';
        }
        if ($(token).find('.num').length <= 0) {
            $(token).find('.tknPos').text(tokenPos);
        }
        //$(token).attr('style','');
    }
}


function setTokenNum(token, num) {
    if (token.length > 0) {
        if (typeof(num) != 'undefined' && num != '') {
            if (num.length >= 3) {
                num = num.substring(0, 2);
            }
            $(token).find('.tknPos').html('<span class="num">' + num + '</span>');
        } else {
            $(token).find('.tknPos').html('');
            setTokenLabel($(token));
        }
    }
}

//ตั้งชื่อผู้เล่น
function setTokenName(token, name) {
    if (token.length > 0) {
        if (name != '' && name != trans_EnterToEdit && name != 'undefined') {
            $(token).removeClass('empty');
            tokenSplitNames(token, name);
        } else {
            $(token).addClass('empty'); //ใส่เพิ่ม แก้บัคแสดงคำว่า กด enter
            tokenSplitNames(token, trans_EnterToEdit);
        }
    }
}
//---------------- อ่านตำแหน่ง -------------------//

function getTokenPos(token) {
    if (typeof(offsetX) == 'undefined') {
        offsetX = 0
    }
    if (typeof(offsetY) == 'undefined') {
        offsetY = 0
    }

    if (token.length > 0) {
        var x = parseInt($(token).css('left').replace('px', ''));
        var y = parseInt($(token).css('top').replace('px', ''));

        // Inside field boundaries, set position label
        if (x >= 123 && x <= 227 && y >= 384) {
            return 'GK'
        }
        else if (x <= 107 && y >= 252) {
            return 'DL'
        }
        else if (x >= 108 && x <= 242 && y >= 295) {
            return 'DC'
        }
        else if (x >= 243 && y >= 252) {
            return 'DR'
        }
        else if (x >= 108 && x <= 242 && y >= 252) {
            return 'DM'
        }
        else if (x <= 107 && y >= 174) {
            return 'ML'
        }
        else if (x >= 108 && x <= 242 && y >= 174) {
            return 'MC'
        }
        else if (x >= 243 && y >= 174) {
            return 'MR'
        }
        else if (x <= 107 && y >= 118) {
            return 'AL'
        }
        else if (x >= 108 && x <= 242 && y >= 118) {
            return 'AC'
        }
        else if (x >= 243 && y >= 118) {
            return 'AR'
        }
        else if (x <= 107) {
            return 'WL'
        }
        else if (x >= 108 && x <= 242) {
            return 'FC'
        }
        else if (x >= 243) {
            return 'WR'
        }
    }

    return false
}

function setTokenLabel(token) {
    if (typeof(offsetX) == 'undefined') {
        offsetX = 0
    }
    if (typeof(offsetY) == 'undefined') {
        offsetY = 0
    }

    if ($(token).find('.num').length > 0) {
        return false;
    }

    if (token.length > 0) {

        var x = parseInt($(token).css('left').replace('px', ''));
        var y = parseInt($(token).css('top').replace('px', ''));


        //ตรวจตำแหน่งเมื่อโดนลากออกนอกเขต
        // Out of field boundaries:
        if (x <= 37) {
            $(token).css({'left': '37px'});
        } else if (x >= new_width) {
            $(token).css({'left': new_width + 'px'});
        }
        if (y <= 40) {
            $(token).css({'top': '40px'});
        } else if (y >= new_height) {
            $(token).css({'top': new_width + 'px'});
        }

        $(token).find('.tknPos').text(getTokenPos($(token)));
        return getTokenPos($(token));

    }
}

//ตั้ง XY
function setTokenOffset(token, offsetX, offsetY) {
    if (typeof(offsetX) == 'undefined' && typeof(offsetY) == 'undefined') {
        return false
    }
    //1. calculate BGImage Scale
    var imgHeight = calc_scale(arrayOriginalWH[0].width, arrayOriginalWH[0].height, $(teamBody).css('width').replace('px',''));
    //$(teamBody).css('width'), arrayOriginalWH[0].width;
    $(teamBody).css('height', imgHeight + 'px');
    $(teamBody).css('max-width', $(teamSize).val() + 'px'); //ตั้งความกว้างมากสุด
    //2. calculate Player position coord
    var newY = calc_coord(offsetY, arrayOriginalWH[0].width, $(teamBody).css('width').replace('px',''));
    var newX = calc_coord(offsetX, arrayOriginalWH[0].height, $(teamBody).css('height').replace('px',''));
    $(token).css({
        'top': newX + 'px',
        'left': newY + 'px'
    });

    //------ keep new XY ------//
    //arrayData[token.replace('#fld1tkn','')].offX = offsetX;
    //arrayData[token.replace('#fld1tkn','')].offY = offsetY;
    //console.log('ppp'+JSON.stringify(token[selector]));
}


function setTokenArrows(token, arrow1, arrow2, arrow3) {
    if (typeof(arrow1) == 'undefined') {
        arrow1 = ''
    }
    if (typeof(arrow2) == 'undefined') {
        arrow2 = ''
    }
    if (typeof(arrow3) == 'undefined') {
        arrow3 = ''
    }
    //ตั้งค่า ศร
    //arrowHeight ความยาวศร / กว้าง origin / ความกว้างปัจจุบัน
    var arrows = new Array(arrow1, arrow2, arrow3);
    $(arrows).each(function (index) {
        var i = parseInt(index) + 1;
        var arrow = $(token).find('.arrow' + i);

        if (this != '') {
            var arrowValues = this.split('-');
            var arrowHeight = arrowValues[0];
            var arrowRot = arrowValues[1];
            $(arrow).addClass('modified');
            $(arrow).css({
                'height': arrowHeight / (arrayOriginalWH[0].width / $(teamBody).css('width').replace('px','')) ,
                '-webkit-transform': 'rotate(' + arrowRot + 'deg)',
                '-ms-transform': 'rotate(' + arrowRot + 'deg)',
                '-moz-transform': 'rotate(' + arrowRot + 'deg)',
                '-o-transform': 'rotate(' + arrowRot + 'deg)',
                'transform': 'rotate(' + arrowRot + 'deg)'
            });
        } else {
            $(arrow).removeClass('modified'); //ลบศรออกก่อน กรณี apply
        }
    });
}


/* --- EXPORT --- */
$(function () {

    exportUrlUpdate();
    /*$('INPUT.exportUrl').focus(function() {
     $(this).select();
     }); */

});

//-------------------- export -------------------------//
function exportUrlUpdate() {
    var exportUrl = $('INPUT.exportUrl');
    var exportEmbed = $('INPUT.exportEmbed');

    var root = getBaseURL();

    var p = $('.matchPlayers').val();
    var a = $('.teamAlignment').val();
    var t = $('INPUT[name="team_name"]').val();
    t = (t == trans_untited) ? '' : t;
    t = escape(t);
    var c = $('#colorSelector DIV').css('backgroundColor');
    c = rgb2hex(c);
    var c2 = $('#colorSelectorBorder DIV').css('backgroundColor');
    c2 = rgb2hex(c2);
    var c3 = $('#colorSelectorNum DIV').css('backgroundColor');
    c3 = rgb2hex(c3);

    var players = [];

    $('.token').each(function (index) {
        var playerVars = [];
        playerVars[0] = $(this).attr('class').match(/pos\w+/g).toString().trim().replace('pos', '');
        playerVars[1] = $(this).find('.tknName').attr('data-name');
        playerVars[1] = escape(playerVars[1]);
        playerVars[1] = (playerVars[1] == escape(trans_EnterToEdit)) ? '' : playerVars[1];
        playerVars[2] = $(this).find('.num').text().trim();
        playerVars[3] = $(this).css('top').replace('px', '');
        playerVars[4] = $(this).css('left').replace('px', '');
        var arrows = $(this).find('.arrow.modified');
        $(arrows).each(function (index) {
            var i = parseInt(index) + 1;
            if ($(this).hasClass('modified')) {
                var arrowHeight = $(this).height();
                //var arrowRot = $(this).rotate(); TO FIX
                //arrowRot = Math.floor(arrowRot.replace('deg',''));
                var arrowRot = getRotationDegrees($(this));
                arrowRot = Math.floor(arrowRot);
                playerVars[4 + i] = arrowHeight + '-' + arrowRot;
            } else {
                playerVars[4 + i] = '';
            }
        });
        players[index] = playerVars.join('_');
    });

    var uriVars = [];
    uriVars[0] = 'p=' + p;
    uriVars[1] = 'a=' + a;
    uriVars[2] = 't=' + t;
    uriVars[3] = 'c=' + c;
    uriVars[4] = '1=' + players[0];
    uriVars[5] = '2=' + players[1];
    uriVars[6] = '3=' + players[2];
    uriVars[7] = '4=' + players[3];
    uriVars[8] = '5=' + players[4];
    uriVars[9] = '6=' + players[5];
    uriVars[10] = '7=' + players[6];
    uriVars[11] = '8=' + players[7];
    uriVars[12] = '9=' + players[8];
    uriVars[13] = '10=' + players[9];
    uriVars[14] = '11=' + players[10];
    uriVars[15] = 'c2=' + c2;
    uriVars[16] = 'c3=' + c3;

    uriVars = uriVars.clean('');
    uriVars = uriVars.join('&');

    var uri = root + '?' + uriVars;
    uri = encodeURI(uri);
    $(exportUrl).val(uri);

    var uriLineup = root + '350x500/?' + uriVars;
    var uriEntities = uriLineup.replace(/&/g, '&amp;');
    $(exportEmbed).val('<iframe width="350" height="500" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="' + uriEntities + '&amp;output=embed"></iframe>');

    updateLineupObject();

}


var hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

Array.prototype.clean = function (deleteValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
};

function rgb2hsv() {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function (c) {
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


function getBaseURL() {
    var url = location.href;  // entire url including querystring - also: window.location.href;
    var baseURL = url.substring(0, url.indexOf('/', 14));

    if (baseURL.indexOf('http://localhost') != -1 || baseURL.indexOf('http://127.0.0.1') != -1) {
        // Base Url for localhost
        var url = location.href;  // window.location.href;
        var pathname = location.pathname;  // window.location.pathname;
        var index1 = url.indexOf(pathname);
        var index2 = url.indexOf("/", index1 + 1);
        var baseLocalUrl = url.substr(0, index2);

        return baseLocalUrl + "/";
    }
    else {
        // Root Url for domain name
        return baseURL + "/";
    }

}


/* --- URL SHORTENER --- */

$(function () {

    $('INPUT.exportUrl').focus(function () {
        //ui1ShortenUrl(this);
        savePreviewImg();
    });

});

//ย่อลิ้งค์ให้สั้นลง
function ui1ShortenUrl(what) {
    var ajaxData = $(what).closest('FORM').serializeArray();

    var url = $(what).val();

    // Fixme: check if is short url
    if (url.length > 50) {

        var dataCollection = {
            "what": what,
            "url": url,
            "ajaxData": ajaxData
        };

        $(what).addClass('loading');
        $(what).val('Shortening URL...');

        ui2ShortenUrl(dataCollection);

    } else {
        $(what).select();
    }
}

function ui2ShortenUrl(dataCollection) {
    // dataCollection: object { key: value ... }

    // agregamos "accion"
    dataCollection.ajaxData.push({"name": "action", "value": "shortenUrl"});

    //transaccion
    var result = $.ajax({
        url: 'ajax/json-shortenUrl.php',
        dataType: 'json',
        data: dataCollection.ajaxData,

        success: function (result) {
            dataCollection.ajaxsuccess = true;
            dataCollection.result = result;
            ui3ShortenUrl(dataCollection);
        },

        error: function (XMLHttpRequest, textStatus, errorThrown) {
            dataCollection.ajaxsuccess = false;
            dataCollection.errorTextStatus = textStatus;
            ui3ShortenUrl(dataCollection);
        }

    });// end $ajax

}


function ui3ShortenUrl(dataCollection) {

    // !ajaxsuccess: error en transaccion
    if (!dataCollection.ajaxsuccess) {
        console.log(dataCollection.errorTextStatus, 'shortened');

        // ajaxsuccess: transaccion valida
    } else {

        //transaccion valida ajax, result.status error
        if (dataCollection.result.status == "error") {
            alert(dataCollection.result.feedbackMessage);

            //transaccion valida ajax && status success/caution returned, continuamos con proceso en la interfaz
        } else {

            //status caution: continuar proceso, mostrando alerta previa
            if (dataCollection.result.status == "caution") {
                alert(dataCollection.result.feedbackMessage);
            }

            var input = $(dataCollection.what);
            $(input).removeClass('loading');
            $(input).val(dataCollection.result.urlShort);
            $('#fld1').attr('data-id', dataCollection.result.id);
            $(input).select();
            updateLineupObject();
        }
    }

}


/* --- EMBED --- */

$(function () {

    $('INPUT.exportEmbed').click(function () {
        $(this).select();
    });

});


function getRotationDegrees(obj) {
    var matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform") ||
        obj.css("-ms-transform") ||
        obj.css("-o-transform") ||
        obj.css("transform");
    if (matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    } else {
        var angle = 0;
    }
    return (angle < 0) ? angle += 360 : angle;
}


/* --- PREVIEW --- */

$(function () {

    updateLineupObject();

});

function updateLineupObject() {
    var lineupId = $("#fld1").attr('data-id');
    var lineupThumb = 'http://lineupbuilder.com/rsrc/preview-default.png';
    var lineupTitle = $("INPUT#teamName").val();
    if (lineupTitle == '' || lineupTitle == trans_untited) {
        lineupTitle = 'Untitled lineup';
    }
    var lineupDescription = getPreviewNames();

    updatePreviewImage();
    updatePreviewNames();
    updateOGMetas(lineupId, lineupThumb, lineupTitle, lineupDescription);
}

//SEO
function updateOGMetas(id, image, title, description) {
    if ($('#fld1vars').val() !== '') {
        $('meta[property="og\\:title"]').attr('content', title);
        $('meta[property="og\\:description"]').attr('content', description);
        $('meta[property="og\\:url"]').attr('content', 'http://lineupbuilder.com/?sk=' + id);
        $('meta[name="twitter\\:url"]').attr('content', 'http://lineupbuilder.com/?sk=' + id);
        $('link[rel="canonical"]').attr('href', 'http://lineupbuilder.com/?sk=' + id);
    } else {
        $('meta[property="og\\:title"]').attr('content', 'Lineup Builder');
        $('meta[property="og\\:description"]').attr('content', 'The quickest way to create football lineups to share on the web.');
        $('meta[property="og\\:url"]').attr('content', 'http://lineupbuilder.com/');
        $('meta[name="twitter\\:url"]').attr('content', 'http://lineupbuilder.com/');
        $('link[rel="canonical"]').attr('href', 'http://lineupbuilder.com/');
    }
}

function updatePreviewNames() {
    var names = getPreviewNames();
    $('#previewNames').text(names);
    $('#export_desc').val(names);
}

function getPreviewNames() {
    var tokensUnlabeled = $('.token.empty:visible');
    if (tokensUnlabeled.length == 0) {
        var gk = [];
        var def = [];
        var mdc = [];
        var mda = [];
        var fwd = [];
        var tokensLabeled = $('.token:visible');
        tokensLabeled.sort(function (a, b) {
            return ($(a).css('left').replace('px', '') - $(b).css('left').replace('px', ''));
        });
        $(tokensLabeled).each(function () {
            var pos = getTokenPos($(this));
            var plyrName = $(this).filter(':not(.empty)').find('.plyr:first');
            if (pos == 'GK') {
                gk.push($(plyrName).text())
            }
            else if (pos == 'DL') {
                def.push($(plyrName).text())
            }
            else if (pos == 'DC') {
                def.push($(plyrName).text())
            }
            else if (pos == 'DR') {
                def.push($(plyrName).text())
            }
            else if (pos == 'DM') {
                mdc.push($(plyrName).text())
            }
            else if (pos == 'ML') {
                mdc.push($(plyrName).text())
            }
            else if (pos == 'MC') {
                mdc.push($(plyrName).text())
            }
            else if (pos == 'MR') {
                mdc.push($(plyrName).text())
            }
            else if (pos == 'AL') {
                mda.push($(plyrName).text())
            }
            else if (pos == 'AC') {
                mda.push($(plyrName).text())
            }
            else if (pos == 'AR') {
                mda.push($(plyrName).text())
            }
            else if (pos == 'WL') {
                fwd.push($(plyrName).text())
            }
            else if (pos == 'FC') {
                fwd.push($(plyrName).text())
            }
            else if (pos == 'WR') {
                fwd.push($(plyrName).text())
            }
        });
        var alignment = [];
        if (def.length > 0) {
            alignment.push(def.length)
        }
        if (mdc.length > 0) {
            alignment.push(mdc.length)
        }
        if (mda.length > 0) {
            alignment.push(mda.length)
        }
        if (fwd.length > 0) {
            alignment.push(fwd.length)
        }

        var namesGk = gk.join(', ');
        var namesDef = def.join(', ');
        var namesMdc = mdc.join(', ');
        var namesMda = mda.join(', ');
        var namesFwd = fwd.join(', ');

        var names = [];
        if (namesGk !== '') {
            names.push(namesGk)
        }
        if (namesDef !== '') {
            names.push(namesDef)
        }
        if (namesMdc !== '') {
            names.push(namesMdc)
        }
        if (namesMda !== '') {
            names.push(namesMda)
        }
        if (namesFwd !== '') {
            names.push(namesFwd)
        }

        var stringNames = alignment.join('-') + ': ' + names.join('; ');

        return stringNames;
    }

    return '';
}

//ตำแหน่งบนภาพ
function updatePreviewImage() {

    var canvas = document.getElementById('previewImage220');

    var img = new Image();
    img.src = '../../images/bg-soccer176x220.png';

    img.onload = function () {
        if (canvas && canvas.getContext) {
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            var width = 176;
            var height = 220;
            var fieldOffset = (canvasWidth - width) / 2;

            var ctx = canvas.getContext('2d');

            // Background color
            ctx.fillStyle = "#F7F7F7";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.shadowBlur = 0;

            // Background image
            ctx.drawImage(
                img,
                (canvasWidth - width) / 2,
                (canvasHeight - height) / 2,
                width,
                height
            );

            var colorBg = rgb2hex($('#colorSelector DIV').css('backgroundColor'));
            var colorStroke = rgb2hex($('#colorSelectorBorder DIV').css('backgroundColor'));

            var imgName = '';

            // Circle
            var tokens = $('#fld1 .token:visible');
            $(tokens).each(function (index) {

                var x = parseInt($(this).css('left').replace('px', ''));
                var y = parseInt($(this).css('top').replace('px', ''));

                ctx.fillStyle = '#' + colorBg;
                ctx.strokeStyle = '#' + colorStroke;
                ctx.lineWidth = 7;
                ctx.shadowColor = "#000";
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 5;
                var degrees = 360;
                var radians = (Math.PI / 180) * degrees;
                ctx.beginPath();
                ctx.arc(
                    (176 * x) / 350 + fieldOffset,
                    (220 * y) / 448,
                    4, 0, radians
                );
                ctx.stroke();
                ctx.fill();

                imgName += y;
                imgName += x;

            });

            imgName += colorBg;
            imgName += colorStroke;

            $('#previewImage220').attr('data-name', imgName);

        }
    };

}

function savePreviewImg() {
    var canvas = document.getElementById('previewImage220');
    var dataURL = canvas.toDataURL();

    var result = $.ajax({
        type: "POST",
        url: 'ajax/json-savePreviewImg.php',
        data: {
            imgBase64: dataURL,
            imgName: $('#previewImage220').attr('data-name')
        }
    });
}


$(function () {

    $('.jsConfirmNew').click(function () {
        var confirmed = confirm('Are you sure you want to clear the current lineup and start a new one?');
        if (!confirmed) {
            return false;
        }
    });

});

