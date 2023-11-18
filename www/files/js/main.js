$(function() 
    {
    click_snd = new Audio("files/sounds/click.mp3");
    dices_snd = new Audio("files/sounds/dice_roll.mp3");
    
    init_2_player_layout ();
//    init_3_player_layout ();
//    init_4_player_layout ();


    init_events ();        
    });


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
    $('.settings .reset').click(function()
        {
        play_click_snd ();
        reset_counters ();
        toggleSettings();
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
        });
    $('.settings .three_player').click(function()
        {
        play_click_snd ();
        init_3_player_layout ();
        toggleSettings();
        });
    $('.settings .four_player').click(function()
        {
        play_click_snd ();
        init_4_player_layout ();
        toggleSettings();
        });
    }

function show_result (obj, value)
    {
    var cnt_obj = $(obj).parent().find('.cnt');
    var curr_val = parseInt($(cnt_obj).text());
    var new_val  = curr_val + value;
    $(cnt_obj).text(new_val);
    }

function set_color(obj)
    {
    var mana_class = $(obj).attr('data-color');
    $(obj).parentsUntil('.player').parent().removeClass('green red black blue white').addClass(mana_class);
    }

function toggleSettings()
    {
    $('.settings').toggleClass('active');
    $('.fullscreen').toggleClass('active');
    $('.mana').toggleClass('active');
    }
function reset_counters ()
    {
    $('.cnt').text('20');
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
    $( ".clone").remove();
    $( ".og" ).removeClass('r90');

    $( ".main_wrap" ).removeClass('layout_3_playes layout_4_playes').addClass('layout_2_playes');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2').removeClass('og green red black blue white').addClass('black');
    reset_counters ();
    }
function init_3_player_layout ()
    {
    $( ".clone").remove();
    $( ".og" ).removeClass('r90');
    $( ".main_wrap" ).removeClass('layout_2_playes layout_4_playes').addClass('layout_3_playes');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2 r90').removeClass('og green red black blue white').addClass('black');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p3 r-90').removeClass('og green red black blue white').addClass('red');
    reset_counters ();
    }
function init_4_player_layout ()
    {
    $( ".clone").remove();
    init_3_player_layout ();
    $( ".main_wrap" ).removeClass('layout_3_playes layout_2_playes').addClass('layout_4_playes');
    $( ".og" ).addClass('r90');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p4 r-90').removeClass('og green red black blue white').addClass('blue');

    reset_counters ();
    }


