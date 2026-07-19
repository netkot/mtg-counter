var starting_life = 20;
var current_layout = 2;

$(function()
    {
    click_snd = new Audio("files/sounds/click.mp3");
    dices_snd = new Audio("files/sounds/dice_roll.mp3");

    if (window.Capacitor && window.Capacitor.isNativePlatform())
        $('body').addClass('native-app');

    if (!load_state())
        init_2_player_layout();

    init_events();
    });


function save_state()
    {
    var players = [];
    $('.player').each(function()
        {
        var el = $(this);
        players.push({
            life:          parseInt(el.find('.cnt').text()),
            poison:        parseInt(el.find('.pcnt').text()) || 0,
            poison_active: el.hasClass('poison-active'),
            poisoned:      el.hasClass('poisoned'),
            colors:        get_player_colors(el)
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
            var colors = p.colors || (p.color ? [p.color] : null);
            if (colors) apply_player_colors(el, colors);
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
    $('.info-toggle').click(function()
        {
        play_click_snd ();
        $('.info-screen').addClass('active');
        });
    $('.info-screen').on('click', function(e)
        {
        if (e.target === this || $(e.target).hasClass('info-close'))
            {
            play_click_snd ();
            $('.info-screen').removeClass('active');
            }
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

var mana_hex = {
    green: '#26b569',
    red:   '#f85555',
    black: '#000000',
    blue:  '#67c1f5',
    white: '#fefedf'
    };

function get_player_colors (player)
    {
    var colors = player.data('colors');
    if (colors && colors.length) return colors.slice();
    var found = [];
    for (var c in mana_hex)
        if (player.hasClass(c)) found.push(c);
    return found.length ? found : ['white'];
    }

function apply_player_colors (player, colors)
    {
    colors = (colors || []).filter(function(c) { return mana_hex[c]; });
    if (!colors.length) colors = ['white'];
    player.data('colors', colors);
    player.removeClass('green red black blue white multicolor').css('background', '');
    player.children('.player-bg').remove();

    // First color comes from the usual player class, the rest are stacked
    // image layers, each one masked so it fades in over the previous stripe
    player.addClass(colors[0]);
    if (colors.length > 1)
        {
        player.addClass('multicolor');
        var bg = $('<div class="player-bg"></div>');
        var n  = colors.length;
        for (var i = 1; i < n; i++)
            {
            var boundary = 100 * i / n;
            var fade     = 25 / n;
            var mask     = 'linear-gradient(to right, transparent ' + (boundary - fade) + '%, #000 ' + (boundary + fade) + '%)';
            $('<div class="bg-' + colors[i] + '"></div>')
                .css({ '-webkit-mask-image': mask, 'mask-image': mask })
                .appendTo(bg);
            }
        player.prepend(bg);
        }

    player.find('.mana > div').each(function()
        {
        $(this).toggleClass('selected', colors.indexOf($(this).attr('data-color')) !== -1);
        });
    }

function set_color(obj)
    {
    var mana   = $(obj).attr('data-color');
    var player = $(obj).closest('.player');
    var colors = get_player_colors(player);
    var idx    = colors.indexOf(mana);

    if (idx === -1)
        colors.push(mana);
    else if (colors.length > 1)
        colors.splice(idx, 1);

    apply_player_colors(player, colors);
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



function clone_player (extra_classes, colors)
    {
    var clone = $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone ' + extra_classes).removeClass('og');
    apply_player_colors(clone, colors);
    return clone;
    }

function init_2_player_layout ()
    {
    current_layout = 2;
    $( ".clone").remove();
    $( ".og" ).removeClass('r90');

    $( ".main_wrap" ).removeClass('layout_3_playes layout_4_playes').addClass('layout_2_playes');
    clone_player('p2', ['black']);
    apply_player_colors($( ".og" ), get_player_colors($( ".og" )));
    reset_counters ();
    }
function init_3_player_layout ()
    {
    current_layout = 3;
    $( ".clone").remove();
    $( ".og" ).removeClass('r90');
    $( ".main_wrap" ).removeClass('layout_2_playes layout_4_playes').addClass('layout_3_playes');
    clone_player('p2 r90',  ['black']);
    clone_player('p3 r-90', ['red']);
    apply_player_colors($( ".og" ), get_player_colors($( ".og" )));
    reset_counters ();
    }
function init_4_player_layout ()
    {
    current_layout = 4;
    $( ".clone").remove();
    init_3_player_layout ();
    $( ".main_wrap" ).removeClass('layout_3_playes layout_2_playes').addClass('layout_4_playes');
    $( ".og" ).addClass('r90');
    clone_player('p4 r-90', ['blue']);

    reset_counters ();
    }


