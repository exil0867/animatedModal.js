/*=========================================
 * animatedModal.js
 * author: João Pereira
 * website: https://joaopereira.pt
 * email: joaopereirawd@gmail.com
 * Licensed MIT
=========================================*/

(function($) {
  var animatedModalManager = {
    activeModal: null,
    activeSettings: null,
    setActive: function(modal, settings) {
      this.activeModal = modal;
      this.activeSettings = settings;
    },
    clearActive: function(modal) {
      if (this.activeModal && this.activeModal[0] === modal[0]) {
        this.activeModal = null;
        this.activeSettings = null;
      }
    }
  };

  $.fn.animatedModal = function(options) {
    var modal = $(this);
    var modalTarget = modal.attr('href').replace('#', '');
    // Defaults
    var closeBt = $('#' + modalTarget).find('[data-modal-close]');
    function getScrollBarWidth() {
      var $outer = $('<div>').css({ visibility: 'hidden', width: 100, overflow: 'scroll' }).appendTo('body'),
        widthWithScroll = $('<div>').css({ width: '100%' }).appendTo($outer).outerWidth();
      $outer.remove();
      return 100 - widthWithScroll;
    }
    var settings = $.extend({
      modalTarget: modalTarget,
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: '0px',
      left: '0px',
      zIndexIn: '9999',
      zIndexOut: '-9999',
      opacityIn: '1',
      opacityOut: '0',
      animatedIn: 'fadeIn',
      animatedOut: 'fadeOut',
      animationDuration: '.2s',
      // Callbacks
      beforeOpen: function() {
        $('html').css('overflowY', 'scroll');
        $('html').add(closeBt).css('marginRight', '0');
        $('#' + modalTarget).css('overflowY', 'hidden');
      },
      afterOpen: function() {
        $('html').css('overflowY', 'hidden');
        $('html').add(closeBt).css('marginRight', getScrollBarWidth());
        $('#' + modalTarget).css('overflowY', 'scroll');
      },
      beforeClose: function() {
        $('html').css('overflowY', 'scroll');
        $('html').add(closeBt).css('marginRight', '0');
        $('#' + modalTarget).css('overflowY', 'hidden');
      },
      afterClose: function() {}



    }, options);

    //console.log(closeBt)

    var href = $(modal).attr('href'),
      id = $('body').find('#' + settings.modalTarget),
      idConc = '#' + id.attr('id');
    //console.log(idConc);
    // Default Classes
    id.addClass('animated');
    id.addClass(settings.modalTarget + '-off');

    //Init styles
    var initStyles = {
      'position': settings.position,
      'width': settings.width,
      'height': settings.height,
      'top': settings.top,
      'left': settings.left,
      'z-index': settings.zIndexOut,
      'opacity': settings.opacityOut,
      '-webkit-animation-duration': settings.animationDuration,
      '-moz-animation-duration': settings.animationDuration,
      '-ms-animation-duration': settings.animationDuration,
      'animation-duration': settings.animationDuration
    };
    //Apply stles
    id.css(initStyles);

    function getAnimationDurationMs(duration) {
      if (!duration) {
        return 0;
      }
      if (typeof duration === 'number') {
        return duration;
      }
      if (duration.indexOf('ms') > -1) {
        return parseFloat(duration);
      }
      if (duration.indexOf('s') > -1) {
        return parseFloat(duration) * 1000;
      }
      return parseFloat(duration);
    }

    function applyAnimationDuration(target, duration) {
      target.css({
        '-webkit-animation-duration': duration,
        '-moz-animation-duration': duration,
        '-ms-animation-duration': duration,
        'animation-duration': duration
      });
    }

    function waitForAnimation(target, duration) {
      var deferred = $.Deferred();
      var durationMs = getAnimationDurationMs(duration);
      var resolved = false;
      var resolveOnce = function() {
        if (resolved) {
          return;
        }
        resolved = true;
        deferred.resolve();
      };
      var timeoutId = setTimeout(resolveOnce, durationMs + 50);
      target.one('webkitAnimationEnd.animatedModal mozAnimationEnd.animatedModal MSAnimationEnd.animatedModal oanimationend.animatedModal animationend.animatedModal', function() {
        clearTimeout(timeoutId);
        resolveOnce();
      });
      if (durationMs === 0) {
        clearTimeout(timeoutId);
        setTimeout(resolveOnce, 0);
      }
      return deferred.promise();
    }

    function openModal() {
      var deferred = $.Deferred();
      applyAnimationDuration(id, settings.animationDuration);
      if (id.hasClass(settings.modalTarget + '-off')) {
        id.removeClass(settings.animatedOut);
        id.removeClass(settings.modalTarget + '-off');
        id.addClass(settings.modalTarget + '-on');
      }

      if (id.hasClass(settings.modalTarget + '-on')) {
        settings.beforeOpen();
        id.css({ 'opacity': settings.opacityIn, 'z-index': settings.zIndexIn });
        id.addClass(settings.animatedIn);
        waitForAnimation(id, settings.animationDuration).then(function() {
          afterOpen();
          animatedModalManager.setActive(id, settings);
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }
      return deferred.promise();
    }

    function closeModal(target, targetSettings, options) {
      var deferred = $.Deferred();
      var duration = targetSettings.animationDuration;
      var isFast = options && options.fast;
      if (isFast) {
        duration = '0s';
      }
      applyAnimationDuration(target, duration);
      targetSettings.beforeClose(); //beforeClose
      if (target.hasClass(targetSettings.modalTarget + '-on')) {
        target.removeClass(targetSettings.modalTarget + '-on');
        target.addClass(targetSettings.modalTarget + '-off');
      }

      if (target.hasClass(targetSettings.modalTarget + '-off')) {
        target.removeClass(targetSettings.animatedIn);
        target.addClass(targetSettings.animatedOut);
        waitForAnimation(target, duration).then(function() {
          afterClose(target, targetSettings);
          applyAnimationDuration(target, targetSettings.animationDuration);
          deferred.resolve();
        });
      } else {
        afterClose(target, targetSettings);
        applyAnimationDuration(target, targetSettings.animationDuration);
        deferred.resolve();
      }
      return deferred.promise();
    }

    modal.click(function(event) {
      event.preventDefault();
      if (href == idConc) {
        var sequence = $.Deferred().resolve().promise();
        if (animatedModalManager.activeModal && animatedModalManager.activeSettings && animatedModalManager.activeModal[0] !== id[0]) {
          sequence = closeModal(animatedModalManager.activeModal, animatedModalManager.activeSettings, { fast: true });
        }
        sequence.then(openModal);
      }
    });



    closeBt.click(function(event) {
      event.preventDefault();
      closeModal(id, settings);
    });

    function afterClose(target, targetSettings) {
      target.css({ 'opacity': targetSettings.opacityOut, 'z-index': targetSettings.zIndexOut });
      targetSettings.afterClose(); //afterClose
      animatedModalManager.clearActive(target);
    }

    function afterOpen() {
      settings.afterOpen(); //afterOpen
    }

  }; // End animatedModal.js

}(jQuery));
