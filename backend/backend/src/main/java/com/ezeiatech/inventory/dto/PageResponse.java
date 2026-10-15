package com.ezeiatech.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int limit;
    private long totalElements;
    private int totalPages;

    public static <T> PageResponse<T> from(Page<T> p){
        return new PageResponse<>(p.getContent(),p.getNumber() + 1,p.getSize(),p.getTotalElements(),p.getTotalPages());
    }
}
