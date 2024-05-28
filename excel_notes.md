# general excel constructs

* Range
    ```
    Range("B3").Value
    ```
* ActiveCell
    ```
    ActiveCell.row
    ```
* Sheet
    ```
    Sheet.cells(x,y).value
    ```

# Common functions

```
COUNTIF(range, condition)
## counts the number of cells in the range, that meet the condition
## Eg:
COUNTIF(A1:A10, B1:B5)
## The result will always be sized to condition.
## Each item in result (Bi) corresponds to how many times Bi is present
## in range A1:A10

MATCH(lookup_value;lookup_array; [match_type])
## It gives the relative position of an item in an array
## that matches a specified value based on match_type.
## match_type = 1, find largest value that is <= lookup_value, (=>lookup_array is ascending)
## match_type = 0, exact match
## match_type = -1, find smallest value that is >= lookup_value, (=>lookup_array is descending)
## Gives N/A if the match isnt found, or if list not in order

FILTER(ARRAY,INCLUDE,[IF_EMPTY])
=FILTER($J$2:$K$28,$L2:$L28="yes","")
## Say, you have inputs in J2:K28, and you have select crition in L2:L28
## you do as above

## count non-blank cells .. search: empty
COUNTA(RANGE)
```

# finance formulae

## Future value

```
=FV(rate_per_period, num_periods, period_payment_in_negative, initial_value_in_negative)
```
* one important point is rate is in `%` (or `/100`)

## Periodic mortgate values

```
=PMT(rate_per_perion, num_periods, present_value_in_negative, fv, loan_type)
```

* `fv` - residual value after the num_periods. Default: 0
* `loan_type` - 0 -- end of period (defalut),  1 -- beginning of period

## find cagr of two amounts

```
=(POWER((FinalAmout/InitialAmount),(1/NumYears))-1)*100

```

# date

```
=DATE(2023,1,12)

##to build a date from another date.. say add 15 months
=DATE(YEAR(B2), MONTH(B2) + 15, DAY(B2))

```



# useful items

## sum rows that have same name

```
=IF(A1<>A2,SUMIF($A$1:A1,A1,$B$1:B1),"")
```

## get unique items from a sheet

```
# Say, A2:A10 has your items, B1 is titled "Unique" (doesnt exist in A2:A10), then you
# get unique items in B2:B<n> and done in the end.

=IFERROR(INDEX($A$2:$A$10, MATCH(0, COUNTIF($B$1:B1, $A$2:$A$10), 0)), "done")

Explanation
# get count of every item in A2:A10 in result-list B2:Bi
                                    COUNTIF($B$1:B1, $A$2:$A$10)
# match the first 0 (basically the item that is not present yet)
                           MATCH(0, COUNTIF($B$1:B1, $A$2:$A$10), 0)
# index into that in original list and get the value
         INDEX($A$2:$A$10, MATCH(0, COUNTIF($B$1:B1, $A$2:$A$10), 0))
# give out a done when match fails to find
=IFERROR(INDEX($A$2:$A$10, MATCH(0, COUNTIF($B$1:B1, $A$2:$A$10), 0)), "done")

## if there are blanks in input, stich in a IFBLANK(.., 1, ..) to get it out of way
=IFERROR(INDEX($A$2:$A$10, MATCH(0,IF(ISBLANK($A$2:$A$10),1,COUNTIF($B$1:B1, $A$2:$A$10)), 0)),"done")


```


# Google-sheets

## Custom Currency

```
[$₹][>9999999]##\,##\,##\,##0.00;
[$₹][>99999]##\,##\,##0.00;
[$₹]##,##0.00
```



