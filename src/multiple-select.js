/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version 1.3.12
 *
 * http://wenzhixin.net.cn/p/multiple-select/
 *
 * This is a modified version of multiple-select
 * @author Ghislain B.
 *
 * Some minor changes were applied to the original with the following changes:
 * - "okButton" boolean flag which when set will add an "OK" button at the end of the list to make it convenient to the user to close the window
 * - "okButtonText" was also added to change locale
 * - made code changes to support re-styling of the radio/checkbox with Font-Awesome or any other font
 * - width option was not working when using "container", added some code to support it
 * - "offsetLeft" (defaults to 0) if we want the drop to be offset from the select element (by default it is aligned left to the element with 0 offset)
 * - "autoAdjustDropHeight" (defaults to False) when set will automatically adjust the drop (up or down) height
 * - "autoAdjustDropPosition" (defaults to False) when set will automatically calculate the area with the most available space and use best possible choice for the drop to show (up/down and left/right)
 * - "autoDropWidth" (defaults to False) when set will automatically adjust the dropdown width with the same size as the select element width
 * - "autoAdjustDropWidthByTextSize" (defaults to false) when set will automatically adjust the drop (up or down) width by the text size (it will use largest text width)
 * - "adjustHeightPadding" (defaults to 10) when using "autoAdjustDropHeight" we might want to add a bottom (or top) padding instead of taking the entire available space
 * - "maxWidth" (defaults to 500) when using "autoAdjustDropWidthByTextSize" we want to make sure not to go too wide, so we can use "maxWidth" to cover that
 * - "minWidth" (defaults to undefined) when using "autoAdjustDropWidthByTextSize" and we want to make sure to have a minimum width
 * - "domElmOkButtonHeight" defaults to 26 (as per CSS), that is the "OK" button element height in pixels inside the drop when using multiple-selection
 * - "domElmSelectSidePadding" defaults to 26 (as per CSS), that is the select DOM element padding in pixels (that is not the drop but the select itself, how tall is it)
 * - "domElmSelectAllHeight" defaults to 39 (as per CSS), that is the DOM element of the "Select All" text area
 * - "useSelectOptionLabel" (defaults to False), when set to True it will use the <option label=""> that can be used to display selected options
 * - "useSelectOptionLabelToHtml" (defaults to False), same as "useSelectOptionLabel" but will also render html
 * Add new methods:
 * - getOptions: returns multiple-select current options (copied from latest version of the original multiple-select.js lib)
 * - refreshOptions: set new multiple-select options and refresh the element (copied from latest version of the original multiple-select.js lib)
 */

(function ($) {

  'use strict';

  // it only does '%s', and return '' when arguments are undefined
  var sprintf = function (str) {
    var args = arguments,
      flag = true,
      i = 1;

    str = str.replace(/%s/g, function () {
      var arg = args[i++];

      if (typeof arg === 'undefined') {
        flag = false;
        return '';
      }
      return arg;
    });
    return flag ? str : '';
  };

  var compareObjects = function (objectA, objectB, compareLength) {
    var aKeys = Object.keys(objectA);
    var bKeys = Object.keys(objectB);

    if (compareLength && aKeys.length !== bKeys.length) {
      return false;
    }

    for (var i = 0; i < aKeys.length; i++) {
      var key = aKeys[i];
      if (bKeys.indexOf(key) >= 0 && objectA[key] !== objectB[key]) {
        return false;
      }
    }

    return true;
  };

  var removeDiacritics = function (str) {
    var defaultDiacriticsRemovalMap = [
      { 'base': 'A', 'letters': /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g },
      { 'base': 'AA', 'letters': /[\uA732]/g },
      { 'base': 'AE', 'letters': /[\u00C6\u01FC\u01E2]/g },
      { 'base': 'AO', 'letters': /[\uA734]/g },
      { 'base': 'AU', 'letters': /[\uA736]/g },
      { 'base': 'AV', 'letters': /[\uA738\uA73A]/g },
      { 'base': 'AY', 'letters': /[\uA73C]/g },
      { 'base': 'B', 'letters': /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g },
      { 'base': 'C', 'letters': /[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g },
      { 'base': 'D', 'letters': /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g },
      { 'base': 'DZ', 'letters': /[\u01F1\u01C4]/g },
      { 'base': 'Dz', 'letters': /[\u01F2\u01C5]/g },
      { 'base': 'E', 'letters': /[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g },
      { 'base': 'F', 'letters': /[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g },
      { 'base': 'G', 'letters': /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g },
      { 'base': 'H', 'letters': /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g },
      { 'base': 'I', 'letters': /[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g },
      { 'base': 'J', 'letters': /[\u004A\u24BF\uFF2A\u0134\u0248]/g },
      { 'base': 'K', 'letters': /[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g },
      { 'base': 'L', 'letters': /[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g },
      { 'base': 'LJ', 'letters': /[\u01C7]/g },
      { 'base': 'Lj', 'letters': /[\u01C8]/g },
      { 'base': 'M', 'letters': /[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g },
      { 'base': 'N', 'letters': /[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g },
      { 'base': 'NJ', 'letters': /[\u01CA]/g },
      { 'base': 'Nj', 'letters': /[\u01CB]/g },
      { 'base': 'O', 'letters': /[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g },
      { 'base': 'OI', 'letters': /[\u01A2]/g },
      { 'base': 'OO', 'letters': /[\uA74E]/g },
      { 'base': 'OU', 'letters': /[\u0222]/g },
      { 'base': 'P', 'letters': /[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g },
      { 'base': 'Q', 'letters': /[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g },
      { 'base': 'R', 'letters': /[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g },
      { 'base': 'S', 'letters': /[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g },
      { 'base': 'T', 'letters': /[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g },
      { 'base': 'TZ', 'letters': /[\uA728]/g },
      { 'base': 'U', 'letters': /[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g },
      { 'base': 'V', 'letters': /[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g },
      { 'base': 'VY', 'letters': /[\uA760]/g },
      { 'base': 'W', 'letters': /[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g },
      { 'base': 'X', 'letters': /[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g },
      { 'base': 'Y', 'letters': /[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g },
      { 'base': 'Z', 'letters': /[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g },
      { 'base': 'a', 'letters': /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g },
      { 'base': 'aa', 'letters': /[\uA733]/g },
      { 'base': 'ae', 'letters': /[\u00E6\u01FD\u01E3]/g },
      { 'base': 'ao', 'letters': /[\uA735]/g },
      { 'base': 'au', 'letters': /[\uA737]/g },
      { 'base': 'av', 'letters': /[\uA739\uA73B]/g },
      { 'base': 'ay', 'letters': /[\uA73D]/g },
      { 'base': 'b', 'letters': /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g },
      { 'base': 'c', 'letters': /[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g },
      { 'base': 'd', 'letters': /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g },
      { 'base': 'dz', 'letters': /[\u01F3\u01C6]/g },
      { 'base': 'e', 'letters': /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g },
      { 'base': 'f', 'letters': /[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g },
      { 'base': 'g', 'letters': /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g },
      { 'base': 'h', 'letters': /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g },
      { 'base': 'hv', 'letters': /[\u0195]/g },
      { 'base': 'i', 'letters': /[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g },
      { 'base': 'j', 'letters': /[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g },
      { 'base': 'k', 'letters': /[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g },
      { 'base': 'l', 'letters': /[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g },
      { 'base': 'lj', 'letters': /[\u01C9]/g },
      { 'base': 'm', 'letters': /[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g },
      { 'base': 'n', 'letters': /[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g },
      { 'base': 'nj', 'letters': /[\u01CC]/g },
      { 'base': 'o', 'letters': /[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g },
      { 'base': 'oi', 'letters': /[\u01A3]/g },
      { 'base': 'ou', 'letters': /[\u0223]/g },
      { 'base': 'oo', 'letters': /[\uA74F]/g },
      { 'base': 'p', 'letters': /[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g },
      { 'base': 'q', 'letters': /[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g },
      { 'base': 'r', 'letters': /[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g },
      { 'base': 's', 'letters': /[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g },
      { 'base': 't', 'letters': /[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g },
      { 'base': 'tz', 'letters': /[\uA729]/g },
      { 'base': 'u', 'letters': /[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g },
      { 'base': 'v', 'letters': /[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g },
      { 'base': 'vy', 'letters': /[\uA761]/g },
      { 'base': 'w', 'letters': /[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g },
      { 'base': 'x', 'letters': /[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g },
      { 'base': 'y', 'letters': /[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g },
      { 'base': 'z', 'letters': /[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g }
    ];

    for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
      str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
    }

    return str;

  };

  var stripScripts = function (str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    var scripts = div.getElementsByTagName('script');
    var i = scripts.length;
    while (i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
    return div.innerHTML;
  }

  function MultipleSelect($el, options) {
    var that = this,
      name = $el.attr('name') || options.name || '';

    this.options = options;

    // hide select element
    this.$el = $el.hide();

    // label element
    this.$label = this.$el.closest('label');
    if (this.$label.length === 0 && this.$el.attr('id')) {
      this.$label = $(sprintf('label[for="%s"]', this.$el.attr('id').replace(/:/g, '\\:')));
    }

    // restore class and title from select element
    this.$parent = $(sprintf(
      '<div class="ms-parent %s" %s/>',
      $el.attr('class') || '',
      sprintf('title="%s"', $el.attr('title'))));

    // add placeholder to choice button
    this.$choice = $(sprintf([
      '<button type="button" class="ms-choice">',
      '<span class="placeholder">%s</span>',
      '<div></div>',
      '</button>'
    ].join(''),
      this.options.placeholder));

    // default position is bottom
    this.$drop = $(sprintf('<div name="%s" class="ms-drop %s"%s></div>',
      $el.attr('name') || options.name || '',
      this.options.position,
      sprintf(' style="width: %s"', this.options.dropWidth)));

    this.$el.after(this.$parent);
    this.$parent.append(this.$choice);
    this.$parent.append(this.$drop);

    if (this.$el.prop('disabled')) {
      this.$choice.addClass('disabled');
    }
    this.$parent.css('width',
      this.options.width ||
      this.$el.css('width') ||
      this.$el.outerWidth() + 20);

    this.selectAllName = 'data-name="selectAll' + name + '"';
    this.selectGroupName = 'data-name="selectGroup' + name + '"';
    this.selectItemName = 'data-name="selectItem' + name + '"';

    if (!this.options.keepOpen) {
      $('body').on('click', handleBodyOnClick.bind(that, $el));
    }
    this.options.onAfterCreate();
  }

  function handleBodyOnClick($el, e) {
    // make sure that all elements are filled before running any logic
    var $target = $(e.target);
    var $firstTarget = $target && $target[0];
    var $firstChoice = this.$choice && this.$choice[0];
    var $firstDrop = this.$drop && this.$drop[0];
    var $parentChoice = $target.parents('.ms-choice');
    var $firstParentChoice = $parentChoice && $parentChoice[0];
    var $parentDrop = $target.parents('.ms-drop');
    var $firstParentDrop = $parentDrop && $parentDrop[0];
    var $firstEl = $el && $el[0];

    if ($firstTarget === $firstChoice || $firstParentChoice === $firstChoice) {
      return;
    }

    if (($firstTarget === $firstDrop || $firstParentDrop !== $firstDrop && e.target !== $firstEl) && this.options && this.options.isOpen) {
      this.close();
    }
  }

  MultipleSelect.prototype = {
    constructor: MultipleSelect,

    init: function () {
      var that = this,
        $ul = $('<ul></ul>');

      this.$drop.html('');

      if (this.options.filter) {
        this.$drop.append([
          '<div class="ms-search">',
          '<input type="text" autocomplete="off" autocorrect="off" autocapitilize="off" spellcheck="false">',
          '</div>'].join('')
        );
      }

      if (this.options.selectAll && !this.options.single) {
        this.$drop.append([
          '<div class="ms-select-all" style="width: 100%">',
          '<label style="width: 100%">',
          sprintf('<input type="checkbox" %s />', this.selectAllName),
          sprintf('<span>%s%s%s</span>',
            this.options.selectAllDelimiter[0],
            this.options.selectAllText,
            this.options.selectAllDelimiter[1]
          ),
          '</label>',
          '</div>'
        ].join(''));
      }

      $.each(this.$el.children(), function (i, elm) {
        $ul.append(that.optionToHtml(i, elm));
      });
      $ul.append(sprintf('<li class="ms-no-results">%s</li>', this.options.noMatchesFound));
      this.$drop.append($ul);

      if (this.options.okButton) {
        this.$okButton = $('<button type="button" class="ms-ok-button">' + this.options.okButtonText + '</button>');
        this.$drop.append(this.$okButton);
      }

      var dropWidth = isNaN(this.options.width) ? this.options.width : this.options.width + 'px';
      this.$drop.css('width', dropWidth);
      this.$drop.find('ul').css('max-height', this.options.maxHeight + 'px');
      this.$drop.find('.multiple').css('width', this.options.multipleWidth + 'px');

      this.$searchInput = this.$drop.find('.ms-search input');
      this.$selectAll = this.$drop.find('input[' + this.selectAllName + ']');
      this.$selectGroups = this.$drop.find('input[' + this.selectGroupName + ']');
      this.$selectItems = this.$drop.find('input[' + this.selectItemName + ']:enabled');
      this.$disableItems = this.$drop.find('input[' + this.selectItemName + ']:disabled');
      this.$noResults = this.$drop.find('.ms-no-results');

      this.events();
      this.updateSelectAll(true);
      this.update(true);

      if (this.options.isOpen) {
        this.open();
      }

      if (this.options.openOnHover) {
        $(".ms-parent").hover(function (e) {
          that.open();
        });
      }
    },

    optionToHtml: function (i, elm, group, groupDisabled) {
      var that = this,
        $elm = $(elm),
        classes = $elm.attr('class') || '',
        label = sprintf('label="%s"', $elm.attr('label') || ''),
        title = sprintf('title="%s"', $elm.attr('title')),
        multiple = this.options.multiple ? 'multiple' : '',
        disabled,
        type = this.options.single ? 'radio' : 'checkbox';

      if ($elm.is('option')) {
        var value = $elm.val(),
          customStyle = this.options.styler(value),
          style = customStyle ? `style="${customStyle}"` : '',
          text = that.options.textTemplate($elm),
          selected = $elm.prop('selected'),
          $el;

        disabled = groupDisabled || $elm.prop('disabled');

        $el = $([
          sprintf('<li class="%s %s" %s %s %s>', multiple, classes, title, style, label),
          sprintf('<label class="%s">', disabled ? 'disabled' : ''),
          sprintf('<input type="%s" %s%s%s%s>',
            type, this.selectItemName,
            selected ? ' checked="checked"' : '',
            disabled ? ' disabled="disabled"' : '',
            sprintf(' data-group="%s"', group)),
          sprintf('<span>%s</span>', text),
          '</label>',
          '</li>'
        ].join(''));
        $el.find('input').val(value);
        return $el;
      }
      if ($elm.is('optgroup')) {
        var label = that.options.labelTemplate($elm),
          $group = $('<div/>');

        group = 'group_' + i;
        disabled = $elm.prop('disabled');

        $group.append([
          '<li class="group">',
          sprintf('<label class="optgroup %s" data-group="%s">', disabled ? 'disabled' : '', group),
          this.options.hideOptgroupCheckboxes || this.options.single ? '' :
            sprintf('<input type="checkbox" %s %s>',
              this.selectGroupName, disabled ? 'disabled="disabled"' : ''),
          label,
          '</label>',
          '</li>'
        ].join(''));

        $.each($elm.children(), function (i, elm) {
          $group.append(that.optionToHtml(i, elm, group, disabled));
        });
        return $group.html();
      }
    },

    events: function () {
      var that = this,
        toggleOpen = function (e) {
          e.preventDefault();
          that[that.options.isOpen ? 'close' : 'open']();
        };

      if (this.$label) {
        this.$label.off('click').on('click', function (e) {
          if (e.target.nodeName.toLowerCase() !== 'label' || e.target !== this) {
            return;
          }
          toggleOpen(e);
          if (!that.options.filter || !that.options.isOpen) {
            that.focus();
          }
          e.stopPropagation(); // Causes lost focus otherwise
        });
      }

      if (this.options.okButton) {
        this.$okButton.off('click').on('click', function (e) {
          toggleOpen(e);
          e.stopPropagation(); // Causes lost focus otherwise
        });
      }

      this.$choice.off('click').on('click', toggleOpen)
        .off('focus').on('focus', this.options.onFocus)
        .off('blur').on('blur', this.options.onBlur);

      this.$parent.off('keydown').on('keydown', function (e) {
        switch (e.which) {
          case 27: // esc key
            that.close();
            that.$choice.focus();
            break;
        }
      });

      this.$searchInput.off('keydown').on('keydown', function (e) {
        // Ensure shift-tab causes lost focus from filter as with clicking away
        if (e.keyCode === 9 && e.shiftKey) {
          that.close();
        }
      }).off('keyup').on('keyup', function (e) {
        // enter or space
        // Avoid selecting/deselecting if no choices made
        if (that.options.filterAcceptOnEnter && (e.which === 13 || e.which === 32) && that.$searchInput.val()) {
          that.$selectAll.click();
          that.close();
          that.focus();
          return;
        }
        that.filter();
      });

      this.$selectAll.off('click').on('click', function () {
        var checked = $(this).prop('checked'),
          $items = that.$selectItems.filter(':visible');

        if ($items.length === that.$selectItems.length) {
          that[checked ? 'checkAll' : 'uncheckAll']();
        } else { // when the filter option is true
          if (that.$selectGroups) {
            that.$selectGroups.prop('checked', checked);
          }
          if ($items) {
            $items.prop('checked', checked);
          }
          that.options[checked ? 'onCheckAll' : 'onUncheckAll']();
          that.update();
        }
      });
      this.$selectGroups.off('click').on('click', function () {
        var group = $(this).parent().attr('data-group'),
          $items = that.$selectItems.filter(':visible'),
          $children = $items.filter(sprintf('[data-group="%s"]', group)),
          checked = $children.length !== $children.filter(':checked').length;
        if ($children) {
          $children.prop('checked', checked);
        }
        that.updateSelectAll();
        that.update();
        that.options.onOptgroupClick({
          label: $(this).parent().text(),
          checked: checked,
          children: $children.get(),
          instance: that
        });
      });
      this.$selectItems.off('click').on('click', function () {
        that.updateSelectAll();
        that.update();
        that.updateOptGroupSelect();
        that.options.onClick({
          label: $(this).parent().text(),
          value: $(this).val(),
          checked: $(this).prop('checked'),
          instance: that
        });

        if (that.options.single) {
          var clickedVal = $(this).val();
          that.$selectItems.filter(function () {
            return $(this).val() !== clickedVal;
          }).each(function () {
            $(this).prop('checked', false);
          });
          that.update();
        }

        if (that.options.single && that.options.isOpen && !that.options.keepOpen) {
          that.close();
        }
      });
    },

    open: function () {
      if (this.$choice.hasClass('disabled')) {
        return;
      }
      this.options.isOpen = true;
      this.$parent.addClass('ms-parent-open');
      this.$choice.find('>div').addClass('open');
      this.$drop[this.animateMethod('show')]();

      // fix filter bug: no results show
      if (this.$selectAll) {
        this.$selectAll.parent().show();
      }
      if (this.$noResults) {
        this.$noResults.hide();
      }

      // Fix #77: 'All selected' when no options
      if (!this.$el.children().length) {
        if (this.$selectAll) {
          this.$selectAll.parent().hide();
        }
        if (this.$noResults) {
          this.$noResults.show();
        }
      }

      if (this.options.offsetLeft) {
        var offset = this.$drop.offset();
        var leftPos = offset.left - this.options.offsetLeft;

        this.$drop.offset({
          top: offset.top,
          left: leftPos
        });
      }

      if (this.options.container) {
        var offset = this.$drop.offset();
        var leftPos = this.options.offsetLeft ? (offset.left - this.options.offsetLeft) : offset.left;

        this.$drop.appendTo($(this.options.container));
        this.$drop.offset({
          top: offset.top,
          left: leftPos
        });
      }

      if (this.options.filter) {
        this.$searchInput.val('');
        this.$searchInput.focus();
        this.filter();
      }

      if (this.options.autoAdjustDropWidthByTextSize) {
        this.adjustDropWidthByText();
      } else if (!this.options.width && this.options.autoDropWidth) {
        this.$drop.css('width', this.$parent.width());
      }

      var newPosition = this.options.position;
      if (this.options.autoAdjustDropHeight) {
        // if autoAdjustDropPosition is enable, we 1st need to see what position the drop will be located
        // without necessary toggling it's position just yet, we just want to know the future position for calculation
        if (this.options.autoAdjustDropPosition) {
          var spaceBottom = this.availableSpaceBottom();
          var spaceTop = this.availableSpaceTop();
          var msDropHeight = this.$drop.outerHeight() || 0;
          newPosition = (spaceBottom < msDropHeight && spaceTop > spaceBottom) ? 'top' : 'bottom';
        }

        // now that we know which drop position will be used, let's adjust the drop height
        this.adjustDropHeight(newPosition);
      }

      if (this.options.autoAdjustDropPosition) {
        this.adjustDropPosition(this.options.autoAdjustDropHeight);
      }

      this.options.onOpen();
    },

    close: function () {
      this.options.isOpen = false;
      this.$parent.removeClass('ms-parent-open');
      this.$choice.find('>div').removeClass('open');
      this.$drop[this.animateMethod('hide')]();
      if (this.options.container) {
        this.$parent.append(this.$drop);
        this.$drop.css({
          'top': 'auto',
          'left': 'auto'
        });
      }
      this.options.onClose();
    },

    animateMethod: function (method) {
      var methods = {
        show: {
          fade: 'fadeIn',
          slide: 'slideDown'
        },
        hide: {
          fade: 'fadeOut',
          slide: 'slideUp'
        }
      };

      return methods[method][this.options.animate] || method;
    },

    adjustDropHeight: function (position) {
      var isDropPositionBottom = position !== 'top' ? true : false;
      var filterHeight = this.options.filter ? this.options.domElmFilterHeight : 0;
      var okButtonHeight = this.options.single ? 0 : this.options.domElmOkButtonHeight;
      var selectAllHeight = this.options.single ? 0 : this.options.domElmSelectAllHeight;
      var msDropMinimalHeight = filterHeight + okButtonHeight + selectAllHeight + 5;

      var spaceBottom = this.availableSpaceBottom();
      var spaceTop = this.availableSpaceTop();

      var newHeight = this.options.maxHeight;
      if (isDropPositionBottom) {
        newHeight = spaceBottom - msDropMinimalHeight - this.options.adjustHeightPadding;
      } else {
        newHeight = spaceTop - msDropMinimalHeight - this.options.adjustHeightPadding;
      }

      if (!this.options.maxHeight || (this.options.maxHeight && newHeight < this.options.maxHeight)) {
        this.$drop.find('ul').css('max-height', (newHeight + 'px'));
        return true; // return true, we adjusted the height
      }

      // did we adjusted the drop height? false
      return false;
    },

    adjustDropPosition: function (forceToggle) {
      var position = 'bottom';
      var msDropHeight = this.$drop.outerHeight() || 0;
      var msDropWidth = this.$drop.outerWidth() || 0;
      var selectOffsetTop = this.$parent.offset().top;
      var selectOffsetLeft = this.$parent.offset().left;
      var selectParentWidth = this.$parent.width();
      var spaceBottom = this.availableSpaceBottom();
      var spaceTop = this.availableSpaceTop();
      var windowWidth = $(window).width();

      // find the optimal position of the drop (always choose "bottom" as the default to use)
      if (spaceBottom > msDropHeight) {
        position = 'bottom';
      } else if ((msDropHeight > spaceBottom) && (spaceTop > spaceBottom)) {
        if (this.options.container) {
          // when using a container, we need to offset the drop ourself
          // and also make sure there's space available on top before doing so
          var newOffsetTop = selectOffsetTop - msDropHeight;
          if (newOffsetTop < 0) {
            newOffsetTop = 0;
          }

          if (newOffsetTop > 0 || forceToggle) {
            position = 'top';
            this.$drop.offset({ top: (newOffsetTop < 0) ? 0 : newOffsetTop });
          }
        } else {
          // without container, we simply need to add the "top" class to the drop
          position = 'top';
          this.$drop.addClass(position);
        }
        this.$drop.removeClass('bottom');
      }

      // auto-adjust left/right position
      if ((windowWidth - msDropWidth) < selectOffsetLeft) {
        var newLeftOffset = selectOffsetLeft - (msDropWidth - selectParentWidth);
        this.$drop.offset({ left: newLeftOffset });
      }

      return position;
    },

    adjustDropWidthByText: function () {
      // keep the dropWidth/width as reference, if our new calculated width is below then we will re-adjust (else do nothing)
      var currentDefinedWidth = this.$parent.width();
      if (this.options.dropWidth || this.options.width) {
        currentDefinedWidth = this.options.dropWidth || this.options.width;
      }

      // calculate the "Select All" element width, this text is configurable which is why we recalculate every time
      var selectParentWidth = this.$parent.width();
      var selectAllElmWidth = $('span', this.$drop).width() + this.options.domElmSelectSidePadding;
      var hasScrollbar = $('ul', this.$drop).hasScrollBar();
      var scrollbarWidth = hasScrollbar ? this.getScrollbarWidth() : 0;
      var maxDropWidth = 0;

      $('li span', this.$drop).each(function (index, elm) {
        var spanWidth = $(elm).width();
        if (spanWidth > maxDropWidth) {
          maxDropWidth = spanWidth;
        }
      });
      maxDropWidth += this.options.domElmSelectSidePadding + scrollbarWidth; // add a padding & include the browser scrollbar width

      // make sure the new calculated width is wide enough to include the "Select All" text (this text is configurable)
      if (maxDropWidth < selectAllElmWidth) {
        maxDropWidth = selectAllElmWidth;
      }

      // if a maxWidth is defined, make sure our new calculate width is not over the maxWidth
      if (this.options.maxWidth && maxDropWidth > this.options.maxWidth) {
        maxDropWidth = this.options.maxWidth;
      }

      // if a minWidth is defined, make sure our new calculate width is not below the minWidth
      if (this.options.minWidth && maxDropWidth < this.options.minWidth) {
        maxDropWidth = this.options.minWidth;
      }

      // if select parent DOM element is bigger then new calculated width, we'll use the same width for the drop as the parent
      if (maxDropWidth < selectParentWidth) {
        maxDropWidth = selectParentWidth;
      }

      // finally re-adjust the drop to the new calculated width when necessary
      if (currentDefinedWidth > maxDropWidth || this.$drop.width() > maxDropWidth || currentDefinedWidth === '100%') {
        this.$drop.css({ 'width': maxDropWidth, 'max-width': maxDropWidth });
      }
    },

    availableSpaceBottom: function () {
      var windowHeight = $(window).innerHeight() || this.options.maxHeight;
      var pageScroll = $(window).scrollTop() || 0;
      var msDropOffsetTop = this.$drop.offset().top;
      return windowHeight - (msDropOffsetTop - pageScroll);
    },

    availableSpaceTop: function () {
      var pageScroll = $(window).scrollTop() || 0;
      var msDropOffsetTop = this.$parent.offset().top;
      return msDropOffsetTop - pageScroll;
    },

    update: function (ignoreTrigger) {
      var selects = this.options.displayValues ? this.getSelects() : this.getSelects('text'),
        $span = this.$choice.find('>span'),
        sl = selects.length;

      if (sl === 0) {
        $span.addClass('placeholder').html(this.options.placeholder);
      } else if (this.options.allSelected && sl === this.$selectItems.length + this.$disableItems.length) {
        $span.removeClass('placeholder').html(this.options.allSelected);
      } else if (this.options.ellipsis && sl > this.options.minimumCountSelected) {
        $span.removeClass('placeholder').text(selects.slice(0, this.options.minimumCountSelected)
          .join(this.options.delimiter) + '...');
      } else if (this.options.countSelected && sl > this.options.minimumCountSelected) {
        $span.removeClass('placeholder').html(this.options.countSelected
          .replace('#', selects.length)
          .replace('%', this.$selectItems.length + this.$disableItems.length));
      } else {
        if (this.options.useSelectOptionLabel || this.options.useSelectOptionLabelToHtml) {
          var labels = this.getSelects('label').join(this.options.delimiter);
          if (this.options.useSelectOptionLabelToHtml) {
            var sanitizedLabels = stripScripts(labels);
            $span.removeClass('placeholder').html(sanitizedLabels);
          } else {
            $span.removeClass('placeholder').text(labels);
          }
        } else {
          $span.removeClass('placeholder').text(selects.join(this.options.delimiter));
        }
      }

      if (this.options.addTitle) {
        var selectType = (this.options.useSelectOptionLabel || this.options.useSelectOptionLabelToHtml) ? 'label' : 'text';
        if ($span) {
          $span.prop('title', this.getSelects(selectType).join(this.options.delimiter));
        }
      }

      // set selects to select
      this.$el.val(this.getSelects());

      // add selected class to selected li
      this.$drop.find('li').removeClass('selected');
      this.$drop.find('input:checked').each(function () {
        $(this).parents('li').first().addClass('selected');
      });

      // trigger <select> change event
      if (!ignoreTrigger) {
        this.$el.trigger('change');
      }
    },

    updateSelectAll: function (isInit) {
      var $items = this.$selectItems;

      if (!isInit) {
        $items = $items.filter(':visible');
      }
      if (this.$selectAll) {
        this.$selectAll.prop('checked', $items.length &&
          $items.length === $items.filter(':checked').length);
        if (!isInit && this.$selectAll.prop('checked')) {
          this.options.onCheckAll();
        }
      }
    },

    updateOptGroupSelect: function () {
      var $items = this.$selectItems.filter(':visible');
      $.each(this.$selectGroups, function (i, val) {
        var group = $(val).parent().attr('data-group'),
          $children = $items.filter(sprintf('[data-group="%s"]', group));
        $(val).prop('checked', $children.length &&
          $children.length === $children.filter(':checked').length);
      });
    },

    getOptions: function () {
      // deep copy and remove data
      const options = $.extend({}, this.options);
      delete options.data;
      return $.extend(true, {}, options);
    },

    refreshOptions: function (options) {
      // If the objects are equivalent then avoid the call of destroy / init methods
      if (compareObjects(this.options, options, true)) {
        return;
      }
      this.options = $.extend(this.options, options);
      this.init();
    },

    //value or text, default: 'value'
    getSelects: function (type) {
      var that = this,
        texts = [],
        labels = [],
        values = [];
      this.$drop.find(sprintf('input[%s]:checked', this.selectItemName)).each(function () {
        texts.push($(this).parents('li').first().text());
        labels.push($(this).parents('li').attr('label') || '');
        values.push($(this).val());
      });

      if (type === 'text' && this.$selectGroups && this.$selectGroups.length) {
        texts = [];
        this.$selectGroups.each(function () {
          var html = [],
            text = $.trim($(this).parent().text()),
            group = $(this).parent().data('group'),
            $children = that.$drop.find(sprintf('[%s][data-group="%s"]', that.selectItemName, group)),
            $selected = $children.filter(':checked');

          if (!$selected || !$selected.length) {
            return;
          }

          html.push('[');
          html.push(text);
          if (($children && $children.length) > ($selected && $selected.length)) {
            var list = [];
            $selected.each(function () {
              list.push($(this).parent().text());
            });
            html.push(': ' + list.join(', '));
          }
          html.push(']');
          texts.push(html.join(''));
        });
      } else if (type === 'label' && this.$selectGroups && this.$selectGroups.length) {
        labels = [];
        this.$selectGroups.each(function () {
          var html = [],
            label = $.trim($(this).attr('label') || ''),
            group = $(this).parent().data('group'),
            $children = that.$drop.find(sprintf('[%s][data-group="%s"]', that.selectItemName, group)),
            $selected = $children.filter(':checked');

          if (!$selected || !$selected.length) {
            return;
          }

          html.push('[');
          html.push(label);
          if (($children && $children.length) > ($selected && $selected.length)) {
            var list = [];
            $selected.each(function () {
              list.push($(this).attr('label') || '');
            });
            html.push(': ' + list.join(', '));
          }
          html.push(']');
          labels.push(html.join(''));
        });
      }

      switch (type) {
        case 'text':
          return texts;
        case 'label':
          return labels;
        default:
          return values;
      }
    },

    getScrollbarWidth: function () {
      var outer = document.createElement("div");
      outer.style.visibility = "hidden";
      outer.style.width = "100px";
      outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

      document.body.appendChild(outer);

      var widthNoScroll = outer.offsetWidth;
      // force scrollbars
      outer.style.overflow = "scroll";

      // add innerdiv
      var inner = document.createElement("div");
      inner.style.width = "100%";
      outer.appendChild(inner);

      var widthWithScroll = inner.offsetWidth;

      // remove divs
      outer.parentNode.removeChild(outer);

      return widthNoScroll - widthWithScroll;
    },

    setSelects: function (values) {
      var that = this;
      if (this.$selectItems && this.$disableItems) {
        this.$selectItems.prop('checked', false);
        this.$disableItems.prop('checked', false);
        $.each(values, function (i, value) {
          var selectedItemElm = that.$selectItems.filter(sprintf('[value="%s"]', value));
          var disabledItemElm = that.$disableItems.filter(sprintf('[value="%s"]', value));
          if (selectedItemElm) {
            selectedItemElm.prop('checked', true);
          }
          if (disabledItemElm) {
            disabledItemElm.prop('checked', true);
          }
        });
        if (this.$selectItems && this.$selectAll) {
          this.$selectAll.prop('checked', this.$selectItems.length ===
            this.$selectItems.filter(':checked').length + this.$disableItems.filter(':checked').length);
        }

        $.each(that.$selectGroups, function (i, val) {
          var group = $(val).parent().attr('data-group'),
            $children = that.$selectItems.filter('[data-group="' + group + '"]');
          $(val).prop('checked', $children.length &&
            $children.length === $children.filter(':checked').length);
        });
      }
      this.update(false);
    },

    enable: function () {
      this.$choice.removeClass('disabled');
    },

    disable: function () {
      this.$choice.addClass('disabled');
    },

    destroy: function () {
      $('body').off('click');
      this.$el.before(this.$parent).show();
      this.$parent.remove();
      this.$choice = null;
      this.$el = null;
      this.$selectItems = null;
      this.$selectGroups = null;
      this.$noResults = null;
      this.options = null;
      this.$parent = null;
    },

    checkAll: function () {
      this.$selectItems && this.$selectItems.prop('checked', true);
      this.$selectGroups && this.$selectGroups.prop('checked', true);
      this.$selectAll && this.$selectAll.prop('checked', true);
      this.update();
      this.options.onCheckAll();
    },

    uncheckAll: function () {
      this.$selectItems && this.$selectItems.prop('checked', false);
      this.$selectGroups && this.$selectGroups.prop('checked', false);
      this.$selectAll && this.$selectAll.prop('checked', false);
      this.update();
      this.options.onUncheckAll();
    },

    focus: function () {
      this.$choice && this.$choice.focus();
      this.options.onFocus();
    },

    blur: function () {
      this.$choice && this.$choice.blur();
      this.options.onBlur();
    },

    refresh: function () {
      this.init();
    },

    filter: function () {
      var that = this,
        text = $.trim(this.$searchInput.val()).toLowerCase();

      if (text.length === 0) {
        this.$selectAll && this.$selectAll.parent().show();
        this.$selectItems && this.$selectItems.parent().show();
        this.$disableItems && this.$disableItems.parent().show();
        this.$selectGroups && this.$selectGroups.parent().show();
        this.$noResults.hide();
        this.$selectItems.each(function () {
          $(this).closest('li').show();
        });
      } else {
        this.$selectItems.each(function () {
          var $parent = $(this).parent();
          var $li = $parent.parent('li');
          var hideOrShow = removeDiacritics($parent.text().toLowerCase()).indexOf(removeDiacritics(text)) < 0 ? 'hide' : 'show';
          $li[hideOrShow]();
        });
        this.$disableItems && this.$disableItems.parent().hide();
        this.$selectGroups.each(function () {
          var $parent = $(this).parent();
          var $li = $parent.parent('li');
          var group = $parent.attr('data-group');
          var $items = that.$selectItems.filter(':visible');
          var hideOrShow = $items.filter(sprintf('[data-group="%s"]', group)).length ? 'show' : 'hide';
          $li[hideOrShow]();
        });

        //Check if no matches found
        if (this.$selectItems && this.$selectItems.parent().filter(':visible').length) {
          this.$selectAll.parent().show();
          this.$noResults.hide();
        } else {
          this.$selectAll && this.$selectAll.parent().hide();
          this.$noResults.show();
        }
      }
      this.updateOptGroupSelect();
      this.updateSelectAll();
      this.options.onFilter(text);
    }
  };

  $.fn.hasScrollBar = function () {
    return this.get(0) && this.get(0).scrollHeight && this.get(0).scrollHeight > this.height();
  }

  $.fn.multipleSelect = function () {
    var option = arguments[0],
      args = arguments,

      value,
      allowedMethods = [
        'getSelects', 'setSelects',
        'getOptions', 'refreshOptions',
        'enable', 'disable',
        'open', 'close',
        'checkAll', 'uncheckAll',
        'focus', 'blur',
        'refresh', 'destroy'
      ];

    this.each(function () {
      var $this = $(this),
        data = $this.data('multipleSelect'),
        options = $.extend({}, $.fn.multipleSelect.defaults,
          $this.data(), typeof option === 'object' && option);

      if (!data) {
        data = new MultipleSelect($this, options);
        $this.data('multipleSelect', data);
      }

      if (typeof option === 'string') {
        if ($.inArray(option, allowedMethods) < 0) {
          throw 'Unknown method: ' + option;
        }
        value = data[option](args[1]);
      } else {
        data.init();
        if (args[1]) {
          value = data[args[1]].apply(data, [].slice.call(args, 2));
        }
      }
    });

    return typeof value !== 'undefined' ? value : this;
  };

  $.fn.multipleSelect.defaults = {
    domElmFilterHeight: 32,
    domElmSelectSidePadding: 26,
    domElmOkButtonHeight: 26,
    domElmSelectAllHeight: 39,
    adjustHeightPadding: 10,
    name: '',
    isOpen: false,
    placeholder: '',
    selectAll: true,
    selectAllDelimiter: ['[', ']'],
    minimumCountSelected: 3,
    ellipsis: false,
    multiple: false,
    multipleWidth: 80,
    single: false,
    filter: false,
    offsetLeft: 0,
    autoAdjustDropHeight: false,
    autoAdjustDropPosition: false,
    autoDropWidth: false,
    autoAdjustDropWidthByTextSize: false,
    width: undefined,
    dropWidth: undefined,
    maxHeight: 250,
    maxWidth: 500,
    minWidth: undefined,
    container: null,
    position: 'bottom',
    keepOpen: false,
    animate: 'none', // 'none', 'fade', 'slide'
    displayValues: false,
    delimiter: ', ',
    addTitle: false,
    filterAcceptOnEnter: false,
    hideOptgroupCheckboxes: false,
    openOnHover: false,
    okButton: false,
    okButtonText: 'OK',
    selectAllText: 'Select all',
    allSelected: 'All selected',
    countSelected: '# of % selected',
    noMatchesFound: 'No matches found',

    styler: function () {
      return false;
    },
    textTemplate: function ($elm) {
      return $elm.html();
    },
    labelTemplate: function ($elm) {
      return $elm.attr('label');
    },

    onOpen: function () {
      return false;
    },
    onClose: function () {
      return false;
    },
    onCheckAll: function () {
      return false;
    },
    onUncheckAll: function () {
      return false;
    },
    onFocus: function () {
      return false;
    },
    onBlur: function () {
      return false;
    },
    onOptgroupClick: function () {
      return false;
    },
    onClick: function () {
      return false;
    },
    onFilter: function () {
      return false;
    },
    onAfterCreate: function () {
      return false;
    }
  };
})(jQuery);