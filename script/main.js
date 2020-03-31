//IIFE - immediatly invoked function expression  

//***BUDGET CONTROLLER*** 
var budgetController = (function () {

    //Expense Function Constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        //new prototype
        this.percentage = 1;
    };

    //add to Expense's prototype. all objects will inherit.

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round( (this.value / totalIncome) * 100 );
        } else {
            this.percentage = 1; 
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    //Income Function Constructor 
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //calculateBudget() - calculate total income and expenses
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            //value from Expense and Income Function Constructors
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    //Data Structure 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    //PUBLIC METHOD ALLOWING OTHER MODULES TO ADD A NEW ITEM TO DATA STRUCTURE

    return {
        addItem: function(type, des, val) {
            
            //declare newItem and ID
            var newItem, ID;

            //Create new ID. ID = last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new Item based on inc or exp type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //type - exp or inc, push newItem to allItems empty array
            data.allItems[type].push(newItem);

            //return the new element 
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            //id = 6 ** ids = [1 2 4 6 8] ** 6 is 'index = 3'

            //difference between map and forEach is map returns a new array

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                //index - position number of where to delete, 1 is how many to delete
                data.allItems[type].splice(index, 1);
            }
          
        },

        

        calculateBudget: function() {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that was spent
            //if > 0 and -1 to prevent 'infinity'
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           

        },

        calculatePercentages: function() {
            //Uses Expense Prototypes

            //Expenses: a=20, b=10, c=40, income=100
            //a=20/100=20%, b=10/100=10%, c=40/100=40%

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {

            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {

            //returns an Object
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        //Public Method to Expose internal Data. In console = budgetController.testing()
        testing: function() {
            console.log(data);
        }
    };

})();




//***UI CONTROLLER***
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--date'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

       //  + or - before number ... 2 decimal points ... comma separating thousands

       
       num = Math.abs(num); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs
       num = num.toFixed(2); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed

       //STRING not Number 
       
       numSplit = num.split('.'); //stored in an array

       int = numSplit[0];

       //lengths over 1000
       //substr() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr
       if (int.length > 3) {
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3); 
       }

       dec = numSplit[1];
       
       return (type === 'exp' ? '-' : '+') + " "  + int + '.' + dec;

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,  //will be inc or exp 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //parseFloat to make string and int.
            }
        },

        //Object is newItem Variable 
        addListItem: function(obj, type) {
            var html, newHTML, element;

            //Create HTML String with placeholder text (single quotes outside if double quotes inside)
            //%id%, %description%, %value%

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element= DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data (from object) - from Function Constructor 

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            //insert HTML into the DOM
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            
        },

        deleteListItem: function(selectorID) {

            //https://blog.garstasio.com/you-dont-need-jquery/dom-manipulation/#removing-elements
            //document.getElementById(selectorID).parentNode.removeChild()
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

            //CLEAR FORM FIELDS 
            clearFields: function() {
                var fields, fieldsArr;

                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

                //tricks slice method into thinking we have given it an array 
                var fieldsArr = Array.prototype.slice.call(fields);

                //forEach has access to args currentValue, indexNumber, array
                fieldsArr.forEach(function(current, index, array) {
                    current.value = "";
                });

                //returns cursor to input field
                //[0] - input description
                fieldsArr[0].focus();
            },

         displayBudget: function(obj) {
           //the object from getBudget()

           var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp'; 

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            //percentage control 
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '---';
            }
         },  

         displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel); //returns a 'node list'

            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            }

            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                }
            });
         },

         displayDate: function() {
            var now, year, month, months;

            now = new Date();
            //console.log(Date()); - right now!
            //var christmas = new Date(2020, 11, 25) - months begin with 0 (Jan = 0)

            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            month = now.getMonth();  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getMonth

            year = now.getFullYear();  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getFullYear

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;          

         },

        //MAKES DOMStrings A PUBLIC METHOD
        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();


//***GLOBAL APP CONTROLLER*** 
var controller = (function (budgetCtrl, UICtrl) {

    //EVENT LISTENER FUNCTIONS
    var setupEventListeners = function () {

        //ACESS TO UIController's DOMstrings
        var DOM = UIController.getDOMstrings();

        //EVENT LISTENER FOR INPUT (CHECK) BUTTON
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        //console.log('Check Button Was Clicked');   

        //KEYPRESS EVENT 
        document.addEventListener('keypress', function (event) {
            //console.log(event);
            if (event.key === 13 || event.which === 13) {
                //console.log('ENTER was pressed.');
                ctrlAddItem();
            }
        });

        //see function for ctrlDeleteItem a few lines down...
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };  

    var updateBudget = function() {
        //1. Calculate the budget 
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        //UIController.displayBudget(budget);
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        //1. Calculate Percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update UI with the new percentages 
        //console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        //DECLARE VARIABLES 
        var input, newItem;

        //1. Get the field input data 
        var input = UIController.getInput();
        console.log(input);

        //ENSURE FIELDS HAVE DATA 
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and Update Budget
            updateBudget();

            //6. Calculate and update Percentages 
            updatePercentages();
        }        
        //console.log('Still Working');
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        //has access to event in addEventListener
        //console.log(event.target);
        //console.log(event.target.parentNode);
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode);
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            //inc-3
            splitID = itemID.split('-'); // ['inc' '3']
            type = splitID[0]; // 'inc'
            //ID was a string - needed to convert it to number
            //ID = splitID[1]; // '3'
            ID = parseInt(splitID[1]); // 3
            
            //1. Delete Item from Data Structure
            budgetController.deleteItem(type, ID);

            //2. Delete Item from User Interface
            UICtrl.deleteListItem(itemID);

            //3. Update and Show New Budget 
            //updateBudget is already an existing function
            updateBudget();

             //4. Calculate and update Percentages 
             updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0, 
                totalInc: 0,
                totalExp: 0,
                percentage: ''
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);

controller.init();

