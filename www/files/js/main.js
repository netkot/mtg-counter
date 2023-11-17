$(function() 
    {
    click_snd = new Audio("files/sounds/click.mp3");
    
    init_2_player_layout ();
//    init_3_player_layout ();
//    init_4_player_layout ();


    init_events ();        
    });


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
    var bg_color_arr   = ['#26b569', '#f85555', '#000', '#67c1f5', '#fefedf'];
    var font_color_arr = ['#000', '#000', '#fff', '#000', '#000'];

    var obj_index = $(obj).index();
    var new_bg_color = bg_color_arr [obj_index];
    var new_font_color = font_color_arr [obj_index];
    
    $(obj).parentsUntil('.player').parent().css('background-color', new_bg_color).css('color', new_font_color);
    //toggleSettings();
    }

function toggleSettings()
    {
    $('.settings').toggleClass('active');
    $('.mana').toggleClass('active');
    $('.fullscreen').toggle();
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

function init_2_player_layout ()
    {
    $( ".clone").remove();
    $( ".main_wrap" ).removeClass('layout_3_playes layout_4_playes').addClass('layout_2_playes');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2').removeClass('og').css('background','#000').css('color','#fff');
    reset_counters ();
    }
function init_3_player_layout ()
    {
    $( ".clone").remove();
    $( ".main_wrap" ).removeClass('layout_2_playes layout_4_playes').addClass('layout_3_playes');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2 r90').removeClass('og').css('background','#000').css('color','#fff');
    $( ".og" ).clone().appendTo( ".main_wrap" ).addClass('clone p2 r-90').removeClass('og').css('background','#f85555');
    reset_counters ();
    }
function init_4_player_layout ()
    {
    $( ".clone").remove();
    $( ".main_wrap" ).removeClass('layout_2_playes layout_3_playes').addClass('layout_4_playes');
    reset_counters ();
    }
