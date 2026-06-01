var starting_life = 20;
var current_layout = 2;

$(function()
    {
    click_snd = new Audio("files/sounds/click.mp3");
    dices_snd = new Audio("files/sounds/dice_roll.mp3");

    if (!load_state())
        init_2_player_layout();

    init_events();
    });


function save_state()
    {
    var colors = ['green', 'red', 'black', 'blue', 'white'];
    var players = [];
    $('.player').each(function()
        {
        var el    = $(this);
        var color = 'white';
        colors.forEach(function(c) { if (el.hasClass(c)) color = c; });
        players.push({
            life:          parseInt(el.find('.cnt').text()),
            poison:        parseInt(el.find('.pcnt').text()) || 0,
            poison_active: el.hasClass('poison-active'),
            poisoned:      el.hasClass('poisoned'),
            color:         color
            });
        });
    try {
        localStorage.setItem('mtg_state', JSON.stringify({
            layout:        current_layout,
            starting_life: starting_life,
            players:       players
            }));
        } catch(e) {}
    }

function load_state()
    {
    var saved = localStorage.getItem('mtg_state');
    if (!saved) return false;
    try {
        var state = JSON.parse(saved);
        starting_life = state.starting_life || 20;
        if      (state.layout === 3) init_3_player_layout();
        else if (state.layout === 4) init_4_player_layout();
        else                         init_2_player_layout();
        $('.player').each(function(i)
            {
            var p = state.players && state.players[i];
            if (!p) return;
            var el = $(this);
            el.find('.cnt').text(p.life);
            el.find('.pcnt').text(p.poison);
            if (p.poison_active) el.addClass('poison-active');
            if (p.poisoned)      el.addClass('poisoned');
            if (p.color)         el.removeClass('green red black blue white').addClass(p.color);
            });
        return true;
        } catch(e) {
        localStorage.removeItem('mtg_state');
        return false;
        }
    }


const canWakeLock = () => 'wakeLock' in navigator;

let wakelock;
async function lockWakeState() {
  if(!canWakeLock()) return;
  try {
    wakelock = await navigator.wakeLock.request();
  } catch(e) {
    console.error('Failed to lock wake state with reason:', e.message);
  }
}

lockWakeState();


function init_events ()
    {
    // Player card events 
    // ==================================================
    $('.main_wrap').on('click', '.m', function()
        {
        play_click_snd ();
        show_result (this, -1) 
        });
    $('.main_wrap').on('click', '.p', function()
        {
        play_click_snd ();
        show_result (this, 1) 
        });
    $('.main_wrap').on('click', '.mana > div', function()
        {
        play_click_snd ();
        set_color(this);
        });

    // Settings events
    // ==================================================
    $('.fullscreen').click(function()
        {
        play_click_snd ();
        toggleFullScreen();
        });
    $('.settings .cog').click(function()
        {
        play_click_snd ();
        toggleSettings();
        });
    $('.settings .life20').click(function()
        {
        play_click_snd ();
        starting_life = 20;
        reset_counters ();
        toggleSettings();
        save_state();
        });
    $('.settings .life40').click(function()
        {
        play_click_snd ();
        starting_life = 40;
        reset_counters ();
        toggleSettings();
        save_state();
        });
    $('.main_wrap').on('click', '.poison-toggle', function()
        {
        play_click_snd ();
        var player = $(this).closest('.player');
        var turning_off = player.hasClass('poison-active');
        player.toggleClass('poison-active');
        if (turning_off)
            {
            player.find('.pcnt').text('0');
            player.removeClass('poisoned');
            }
        save_state();
        });
    $('.main_wrap').on('click', '.pm', function()
        {
        play_click_snd ();
        change_poison (this, -1);
        });
    $('.main_wrap').on('click', '.pp', function()
        {
        play_click_snd ();
        change_poison (this, 1);
        });
    $('.dice').click(function()
        {
        play_click_snd ();
        toggleSettings();
        roll_dices ();

        // Fade out dices
        setTimeout(function() {
            $('.player .dice_shadow').fadeOut()
            }, 5000);
        });
    $('.settings .two_player').click(function()
        {
        play_click_snd ();
        init_2_player_layout ();
        toggleSettings();
        save_state();
        });
    $('.settings .three_player').click(function()
        {
        play_click_snd ();
        init_3_player_layout ();
        toggleSettings();
        save_state();
        });
    $('.settings .four_player').click(function()
        {
        play_click_snd ();
        init_4_player_layout ();
        toggleSettings();
        save_state();
        });
    }

function show_result (obj, value)
    {
    var player  = $(obj).parent();
    var cnt_obj = player.find('.cnt');
    var curr_val = parseInt(cnt_obj.text());
    cnt_obj.text(curr_val + value);
    update_delta(player, value);
    save_state();
    }

function update_delta (player, value)
    {
    var delta_el = player.find('.delta');
    var current  = (parseInt(delta_el.data('delta')) || 0) + value;
    delta_el.data('delta', current);

    var text = current > 0 ? '+' + current : String(current);
    delta_el.text(text).stop(true).css('opacity', 1).show();

    clearTimeout(player.data('delta-timer'));
    player.data('delta-timer', setTimeout(function()
        {
        delta_el.fadeOut(1200, function() { delta_el.data('delta', 0); });
        }, 1500));
    }

function set_color(obj)
    {
    var mana_class = $(obj).attr('data-color');
    $(obj).parentsUntil('.player').parent().removeClass('green red black blue white').addClass(mana_class);
    save_state();
    }

function toggleSettings()
    {
    $('.settings').toggleClass('active');
    $('.fullscreen').toggleClass('active');
    $('.mana').toggleClass('active');
    $('.main_wrap').toggleClass('settings-open');
    }
function reset_counters ()
    {
    $('.player').each(function() { clearTimeout($(this).data('delta-timer')); });
    $('.cnt').text(starting_life);
    $('.pcnt').text('0');
    $('.delta').stop(true).hide().data('delta', 0);
    $('.player').removeClass('poisoned poison-active');
    }

function change_poison (obj, value)
    {
    var pcnt = $(obj).siblings('.pcnt');
    var curr = parseInt(pcnt.text());
    var next = Math.max(0, Math.min(10, curr + value));
    pcnt.text(next);
    $(obj).closest('.player').toggleClass('poisoned', next >= 10);
    save_state();
    }

function play_click_snd ()
    {
    click_snd.play(); 
    click_snd.currentTime=0;
    }

function roll_dices ()
    {
    $('.player .dice_shadow').show();

    dices_snd.play(); 
    dices_snd.currentTime=0;

    how_many_rolls = 10;
    roll_cnt = 0;
    slow_roll_dices ();
    }


function slow_roll_dices ()
    {
    max_roll = 0;
    max_roll_cnt = 1;
    last_val = 0;
    $('.player .dice').each(function(index) {
        val =  randomIntFromInterval(1, 6);
        if (val > max_roll)
            max_roll = val;
        else    
            {
            if (max_roll == val)
                max_roll_cnt++;
            }

        class_name = 'd' + val;
        $(this).removeClass().addClass('dice rolled ' + class_name);
        last_val = val;
//        console.log ('p' + index + ':' + val);
        });
    roll_cnt++;

//    console.log ('=================================');

    if (roll_cnt < how_many_rolls)
        {
        setTimeout(function() {
            slow_roll_dices ();
            }, roll_cnt * 15);
        }
    else
        {
//        console.log ('max_roll     = ' + max_roll);
//        console.log ('max_roll_cnt = ' + max_roll_cnt);

        if (max_roll_cnt > 1)
            {
//            console.log ('Fast reroll!');
            fast_roll_dices ();
            }

        setTimeout(function() {
            stop_roll ();
            }, 100);
        }
    }


function fast_roll_dices ()
    {
    max_roll = 0;
    max_roll_cnt = 1;
    last_val = 0;
    $('.player .dice').each(function(index) {
        val =  randomIntFromInterval(1, 6);
        if (val > max_roll)
            max_roll = val;
        else    
            {
            if (max_roll == val)
                max_roll_cnt++;
            }
        class_name = 'd' + val;
        $(this).removeClass().addClass('dice static ' + class_name);

        last_val = val;
//        console.log ('p' + index + ':' + val);
        });
    roll_cnt++;

//    console.log ('=================================');


    if (max_roll_cnt > 1)
        {
        fast_roll_dices ();
//        console.log ('Fast reroll! Again!');
        }

    }

function stop_roll ()
    {
    $('.player .dice').removeClass('rolled').addClass('static');
    }

function randomIntFromInterval(min, max) 
    {
    return Math.floor(Math.random() * (max - min + 1) + min)
    }



function init_2_player_layout ()
    {
    current_layout = 2;
    $( ".clone").remove();
    $( ".og" ).removeClass('r90');

    $( ".main_wrap" ).removeClass('layout_3_playes layout_4_playes').addClass('layout_2_playes');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2').removeClass('og green red black blue white').addClass('black');
    reset_counters ();
    }
function init_3_player_layout ()
    {
    current_layout = 3;
    $( ".clone").remove();
    $( ".og" ).removeClass('r90');
    $( ".main_wrap" ).removeClass('layout_2_playes layout_4_playes').addClass('layout_3_playes');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2 r90').removeClass('og green red black blue white').addClass('black');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p3 r-90').removeClass('og green red black blue white').addClass('red');
    reset_counters ();
    }
function init_4_player_layout ()
    {
    current_layout = 4;
    $( ".clone").remove();
    init_3_player_layout ();
    $( ".main_wrap" ).removeClass('layout_3_playes layout_2_playes').addClass('layout_4_playes');
    $( ".og" ).addClass('r90');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p4 r-90').removeClass('og green red black blue white').addClass('blue');

    reset_counters ();
    }


